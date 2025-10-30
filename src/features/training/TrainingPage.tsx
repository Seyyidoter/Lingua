"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw } from "lucide-react";
import McqMode from "./McqMode";
import WriteMode from "./WriteMode";
import ListenMode from "./ListenMode";
import { DatasetPicker, Stat } from "./components/SubComponents";
import { useSRSState } from "@/lib/srs";
import { EN_TR } from "@/lib/datasets/en_tr";
import { TR_RU } from "@/lib/datasets/tr_ru";
import type { DatasetKey, Item } from "@/lib/types";

const ALL_DATASETS: Record<DatasetKey, Item[]> = {
  en_tr: EN_TR,
  tr_ru: TR_RU,
};


export default function TrainingPage() {
  const [datasetKey, setDatasetKey] = useState<"en_tr" | "tr_ru">("en_tr");
  const data = ALL_DATASETS[datasetKey];          // 👈 burada ALL_DATASETS
  const srs = useSRSState(`lingua.srs.${datasetKey}`, data);
  const [tab, setTab] = useState<"mcq" | "write" | "listen">("mcq");

  // SSR güvenli başlangıç: önce 0, mount'tan sonra localStorage'dan yükle
  const [total, setTotal] = useState<number>(0);
  const [correct, setCorrect] = useState<number>(0);

  // Dataset değiştiğinde tarayıcıda değerleri oku
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(`lingua.total.${datasetKey}`);
    const c = window.localStorage.getItem(`lingua.correct.${datasetKey}`);
    setTotal(t ? Number(t) : 0);
    setCorrect(c ? Number(c) : 0);
  }, [datasetKey]);

  // total/correct değişince tarayıcıda yaz
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`lingua.total.${datasetKey}`, String(total));
  }, [datasetKey, total]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`lingua.correct.${datasetKey}`, String(correct));
  }, [datasetKey, correct]);

  const accuracy = total ? Math.round((100 * correct) / total) : 0;

  function finishQuestion(ok: boolean, itemId: number) {
    setTotal((t) => t + 1);
    setCorrect((c) => c + (ok ? 1 : 0));
    srs.bump(itemId, ok);
    // localStorage'a yazma işini yukarıdaki useEffect'ler yapıyor
  }

  function resetProgress() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(`lingua.srs.${datasetKey}`);
    window.localStorage.removeItem(`lingua.total.${datasetKey}`);
    window.localStorage.removeItem(`lingua.correct.${datasetKey}`);
    window.location.reload();
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-white to-emerald-100 text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">LinguaWrite</h1>
            <p className="text-sm text-muted-foreground">
              Learn by listening, writing, and recalling actively.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DatasetPicker value={datasetKey} onChange={setDatasetKey} />
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

        <Tabs value={tab} onValueChange={(v) => setTab(v as "mcq" | "write" | "listen")}>
          <TabsList className="mb-4 flex gap-2 bg-white/40 backdrop-blur rounded-lg p-1">
            <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
            <TabsTrigger value="write">Type the Answer</TabsTrigger>
            <TabsTrigger value="listen">Listen &amp; Type</TabsTrigger>
          </TabsList>

          <TabsContent value="mcq">
            <McqMode data={data} srs={srs} onFinish={finishQuestion} />
          </TabsContent>

          <TabsContent value="write">
            <WriteMode data={data} srs={srs} onFinish={finishQuestion} />
          </TabsContent>

          <TabsContent value="listen">
            <ListenMode data={data} srs={srs} onFinish={finishQuestion} datasetKey={datasetKey} />
          </TabsContent>
        </Tabs>

        <footer className="mt-8 text-xs text-muted-foreground text-center">
          <p>Dataset-agnostic design. Add more languages easily.</p>
        </footer>
      </div>
    </div>
  );
}
