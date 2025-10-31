// features/training/TrainingPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw } from "lucide-react";

import McqMode from "./McqMode";
import WriteMode from "./WriteMode";
import ListenMode from "./ListenMode";

import { DatasetPicker, Stat, DirectionPicker, LevelPicker } from "./components/SubComponents";
import { useSRSState } from "@/lib/srs";

import type { DatasetKey, Item, TriEntry, CEFR } from "@/lib/types";
import { OXFORD3K } from "@/lib/datasets";

// ------- helper: TriEntry -> Item -------
function projectToItems(entries: TriEntry[], pair: DatasetKey, direction: "forward" | "reverse"): Item[] {
  // pair’e göre iki dili seç
  const pick = (e: TriEntry) => {
    if (pair === "en_tr") {
      return direction === "forward"
        ? { src: e.en, dst: e.tr }
        : { src: e.tr, dst: e.en };
    } else {
      // tr_ru
      return direction === "forward"
        ? { src: e.tr, dst: e.ru }
        : { src: e.ru, dst: e.tr };
    }
  };

  return entries.map((e) => {
    const { src, dst } = pick(e);
    return { id: e.id, src, dst, pos: e.pos, level: e.level };
  });
}

export default function TrainingPage() {
  const [pair, setPair] = useState<DatasetKey>("en_tr");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const [level, setLevel] = useState<CEFR | "ALL">("ALL");
  const [tab, setTab] = useState<"mcq" | "write" | "listen">("mcq");

  // Level filtre
  const filtered: TriEntry[] = useMemo(
    () => (level === "ALL" ? OXFORD3K : OXFORD3K.filter((x) => x.level === level)),
    [level]
  );

  // Projeksiyon (modların beklediği {src,dst})
  const data: Item[] = useMemo(
    () => projectToItems(filtered, pair, direction),
    [filtered, pair, direction]
  );

  // SRS state (anahtar seviyeyi ve çifti içersin)
  const srs = useSRSState(`lingua.srs.${pair}.${level}.${direction}`, data);

  // basit istatistik (localStorage)
  const [total, setTotal] = useState<number>(0);
  const [correct, setCorrect] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(`lingua.total.${pair}.${level}`);
    const c = window.localStorage.getItem(`lingua.correct.${pair}.${level}`);
    setTotal(t ? Number(t) : 0);
    setCorrect(c ? Number(c) : 0);
  }, [pair, level]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`lingua.total.${pair}.${level}`, String(total));
  }, [pair, level, total]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`lingua.correct.${pair}.${level}`, String(correct));
  }, [pair, level, correct]);

  const accuracy = total ? Math.round((100 * correct) / total) : 0;

  function finishQuestion(ok: boolean, itemId: number) {
    setTotal((t) => t + 1);
    setCorrect((c) => c + (ok ? 1 : 0));
    srs.bump(itemId, ok);
  }

  function resetProgress() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(`lingua.srs.${pair}.${level}.${direction}`);
    window.localStorage.removeItem(`lingua.total.${pair}.${level}`);
    window.localStorage.removeItem(`lingua.correct.${pair}.${level}`);
    window.location.reload();
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-white to-emerald-100 text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">LinguaWrite</h1>
            <p className="text-sm text-muted-foreground">Oxford 3000 • Level-based practice</p>
          </div>

          <div className="flex items-center gap-2">
            <DatasetPicker value={pair} onChange={(v) => { setPair(v); setDirection("forward"); }} />
            <DirectionPicker value={direction} onChange={setDirection} datasetKey={pair} />
            <LevelPicker value={level} onChange={setLevel} />
            <Button variant="secondary" onClick={resetProgress}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </header>

        <Card className="mb-6 backdrop-blur-md bg-white/30 shadow-lg border-none">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat label="Items" value={String(data.length)} />
            <Stat label="Total" value={String(total)} />
            <Stat label="Accuracy" value={`${accuracy}%`} />
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="mb-4 flex gap-2 bg-white/40 backdrop-blur rounded-lg p-1">
            <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
            <TabsTrigger value="write">Type the Answer</TabsTrigger>
            <TabsTrigger value="listen">Listen &amp; Type</TabsTrigger>
          </TabsList>

          <TabsContent value="mcq">
            <McqMode
              key={`mcq-${pair}-${direction}-${level}`}
              data={data}
              srs={srs}
              onFinish={finishQuestion}
              direction={direction}
              datasetKey={pair}
            />
          </TabsContent>

          <TabsContent value="write">
            <WriteMode
              key={`write-${pair}-${direction}-${level}`}
              data={data}
              srs={srs}
              onFinish={finishQuestion}
              direction={direction}
              datasetKey={pair}
            />
          </TabsContent>

          <TabsContent value="listen">
            <ListenMode
              key={`listen-${pair}-${direction}-${level}`}
              data={data}
              srs={srs}
              onFinish={finishQuestion}
              datasetKey={pair}
              direction={direction}
            />
          </TabsContent>
        </Tabs>

        <footer className="mt-8 text-xs text-muted-foreground text-center">
          <p>Dataset-agnostic design. Add more languages easily.</p>
        </footer>
      </div>
    </div>
  );
}
