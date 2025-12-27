// features/training/TrainingPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Flame } from "lucide-react"; // EKLENDI: Flame ikonu

import McqMode from "./McqMode";
import WriteMode from "./WriteMode";
import ListenMode from "./ListenMode";
import StoryMode from "./StoryMode";

import { DatasetPicker, Stat, DirectionPicker, LevelPicker } from "./components/SubComponents";
import { useSRSState } from "@/lib/srs";
import { useStreak } from "@/hooks/useStreak"; // EKLENDI: Streak hook'u

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

import { motion } from "framer-motion";

export default function TrainingPage() {
  const [pair, setPair] = useState<DatasetKey>("en_tr");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const [level, setLevel] = useState<CEFR | "ALL">("ALL");
  const [tab, setTab] = useState<"mcq" | "write" | "listen" | "story">("mcq");

  // EKLENDI: Streak hook kullanımı
  const { streak, hasPracticedToday, updateStreak } = useStreak();

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

    // EKLENDI: Doğru cevap verilirse streak'i güncelle
    if (ok) {
      updateStreak();
    }
  }

  function resetProgress() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(`lingua.srs.${pair}.${level}.${direction}`);
    window.localStorage.removeItem(`lingua.total.${pair}.${level}`);
    window.localStorage.removeItem(`lingua.correct.${pair}.${level}`);
    window.location.reload();
  }

  return (
    <div className="min-h-screen w-full text-foreground p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 md:gap-0">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
              Linguino
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Oxford 3000 • Level-based practice</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            {/* EKLENDI: Streak Göstergesi */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all glass ${hasPracticedToday
                ? "border-orange-200/50 bg-orange-50/50 text-orange-600"
                : "border-gray-200/50 bg-gray-50/50 text-gray-400 grayscale"
                }`}
              title={hasPracticedToday ? "Great job! Streak active." : "Practice to keep the streak!"}
            >
              <Flame className={`w-5 h-5 ${hasPracticedToday ? "fill-orange-500 animate-pulse" : ""}`} />
              <span className="font-bold text-lg">{streak}</span>
            </motion.div>
            {/* ------------------------- */}

            <div className="flex flex-wrap gap-2 justify-center">
              <DatasetPicker value={pair} onChange={(v) => { setPair(v); setDirection("forward"); }} />
              <DirectionPicker value={direction} onChange={setDirection} datasetKey={pair} />
              <LevelPicker value={level} onChange={setLevel} />
            </div>

            <Button variant="ghost" size="icon" onClick={resetProgress} title="Reset Progress" className="ml-2">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <Card className="mb-8 glass border-none">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Stat label="Items Available" value={String(data.length)} />
            <Stat label="Total Questions" value={String(total)} />
            <Stat label="Accuracy Rate" value={`${accuracy}%`} />
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="mb-6 w-full flex flex-wrap justify-center md:justify-start gap-3 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="mcq"
              className="glass flex-1 min-w-[140px] md:min-w-0 md:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-3 rounded-xl transition-all shadow-sm"
            >
              Multiple Choice
            </TabsTrigger>
            <TabsTrigger
              value="write"
              className="glass flex-1 min-w-[140px] md:min-w-0 md:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-3 rounded-xl transition-all shadow-sm"
            >
              Type the Answer
            </TabsTrigger>
            <TabsTrigger
              value="listen"
              className="glass flex-1 min-w-[140px] md:min-w-0 md:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-3 rounded-xl transition-all shadow-sm"
            >
              Listen & Translate
            </TabsTrigger>
            <TabsTrigger
              value="story"
              className="glass flex-1 min-w-[140px] md:min-w-0 md:flex-none data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-3 rounded-xl transition-all border-indigo-200 shadow-sm"
            >
              Story of the Day
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[400px]">
            <TabsContent value="mcq" className="mt-0">
              <McqMode
                key={`mcq-${pair}-${direction}-${level}`}
                data={data}
                srs={srs}
                onFinish={finishQuestion}
                direction={direction}
                datasetKey={pair}
              />
            </TabsContent>

            <TabsContent value="write" className="mt-0">
              <WriteMode
                key={`write-${pair}-${direction}-${level}`}
                data={data}
                srs={srs}
                onFinish={finishQuestion}
                direction={direction}
                datasetKey={pair}
              />
            </TabsContent>

            <TabsContent value="listen" className="mt-0">
              <ListenMode
                key={`listen-${pair}-${direction}-${level}`}
                data={data}
                srs={srs}
                onFinish={finishQuestion}
                datasetKey={pair}
                direction={direction}
              />
            </TabsContent>

            <TabsContent value="story" className="mt-0">
              <StoryMode
                key={`story-${pair}-${direction}-${level}`}
                data={data}
                datasetKey={pair}
              />
            </TabsContent>
          </div>
        </Tabs>

        <footer className="mt-12 text-sm text-muted-foreground text-center opacity-60">
          <p>Linguino &copy; 2025 • Enhanced with Gemini 3</p>
        </footer>
      </motion.div>
    </div>
  );
}