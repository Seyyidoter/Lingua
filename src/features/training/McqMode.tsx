"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2 } from "lucide-react";
import { motion } from "framer-motion";

import type { Item } from "@/lib/types";
import type { SRSApi } from "@/lib/srs";
import { eq, shuffle, speak } from "@/lib/utils";
import { Feedback } from "./components/SubComponents";

type MCQState = {
  item: Item;
  options: string[];
  chosen: string | null;
  done: boolean;
};

const LABELS: Record<"en_tr" | "tr_ru", { src: string; dst: string; ttsSrc: string; ttsDst: string }> = {
  en_tr: { src: "English", dst: "Turkish", ttsSrc: "en-US", ttsDst: "tr-TR" },
  tr_ru: { src: "Turkish", dst: "Russian", ttsSrc: "tr-TR", ttsDst: "ru-RU" },
};

export default function McqMode({
  data,
  srs,
  onFinish,
  direction,
  datasetKey,
}: {
  data: Item[];
  srs: SRSApi;
  onFinish: (ok: boolean, itemId: number) => void;
  direction: "forward" | "reverse";
  datasetKey: "en_tr" | "tr_ru";
}) {
  const [mcq, setMcq] = useState<MCQState | null>(null);
  const labels = LABELS[datasetKey];

  const safePick = (): Item | undefined => {
    // SRS’ten almayı dene
    const picked = typeof srs.pickWeighted === "function" ? srs.pickWeighted() : undefined;
    if (picked) return picked;

    // Fallback: dataset’ten rastgele
    if (data && data.length > 0) {
      const rnd = data[Math.floor(Math.random() * data.length)];
      return rnd;
    }
    return undefined;
  };

  const generateMCQ = () => {
    if (!data || data.length === 0) {
      setMcq(null);
      return;
    }

    const item = safePick();
    if (!item) {
      // SRS destesi boşalmış olabilir -> güvenli çık
      setMcq(null);
      return;
    }

    // forward: src -> dst, reverse: dst -> src
    const promptText = direction === "forward" ? item.src : item.dst;
    const correct = direction === "forward" ? item.dst : item.src;

    // Şık havuzu: hedef dildeki kelimelerden
    const pool = direction === "forward" ? data.map((d) => d.dst) : data.map((d) => d.src);
    const wrongs = shuffle(pool.filter((x) => x !== correct)).slice(0, 3);
    const options = shuffle([correct, ...wrongs]);

    setMcq({ item, options, chosen: null, done: false });

    // İstersen otomatik seslendirme:
    // speak(promptText, direction === "forward" ? labels.ttsSrc : labels.ttsDst);
  };

  useEffect(() => {
    generateMCQ();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, direction, datasetKey]);

  if (!mcq) {
    // UI boş kalmasın diye küçük bir skeleton göstermek istersen:
    return (
      <Card className="backdrop-blur bg-white/40 border-none shadow-lg">
        <CardHeader>
          <CardTitle>Loading question…</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Preparing items…</div>
        </CardContent>
      </Card>
    );
  }

  const targetLabel = direction === "forward" ? labels.dst : labels.src;
  const title = `Translate to ${targetLabel}`;

  const promptText = direction === "forward" ? mcq.item.src : mcq.item.dst;
  const speakLang = direction === "forward" ? labels.ttsSrc : labels.ttsDst;

  const correctAnswer = direction === "forward" ? mcq.item.dst : mcq.item.src;

  const chooseMCQ = (opt: string) => {
    if (!mcq || mcq.done) return;
    const ok = eq(correctAnswer, opt);
    onFinish(ok, mcq.item.id);
    setMcq({ ...mcq, chosen: opt, done: true });
  };

  const nextMCQ = () => generateMCQ();

  return (
    <Card className="backdrop-blur bg-white/40 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="ml-2">
            {promptText}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto"
            onClick={() => speak(promptText, speakLang)}
            title="Play pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mcq.options.map((opt, i) => {
            const chosen = mcq.chosen === opt;
            const isCorrect = eq(opt, correctAnswer);
            const variant = mcq.done
              ? chosen
                ? isCorrect
                  ? "default"
                  : "destructive"
                : isCorrect
                ? "default"
                : "outline"
              : "outline";
            return (
              <motion.div key={i} whileTap={{ scale: 0.98 }}>
                <Button
                  variant={variant as any}
                  className="w-full justify-start"
                  onClick={() => chooseMCQ(opt)}
                  disabled={mcq.done}
                >
                  {opt}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2">
          {mcq.done ? (
            <Feedback ok={eq(mcq.chosen || "", correctAnswer)} correct={correctAnswer} />
          ) : (
            <span className="text-sm text-muted-foreground">Choose the correct translation.</span>
          )}
          <div className="ml-auto">
            <Button variant="secondary" onClick={nextMCQ}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
