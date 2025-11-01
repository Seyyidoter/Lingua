"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

import type { Item } from "@/lib/types";
import type { SRSApi } from "@/lib/srs";
import { fuzzyEq, hint, speak } from "@/lib/utils";
import { Feedback } from "./components/SubComponents";
import VirtualKeyboard from "./components/VirtualKeyboard";

type WritingState = { item: Item; done: boolean; ok: boolean | null };

const LABELS: Record<
  "en_tr" | "tr_ru",
  { src: string; dst: string; ttsSrc: string; ttsDst: string }
> = {
  en_tr: { src: "English", dst: "Turkish", ttsSrc: "en-US", ttsDst: "tr-TR" },
  tr_ru: { src: "Turkish", dst: "Russian", ttsSrc: "tr-TR", ttsDst: "ru-RU" },
};

export default function WriteMode({
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
  const [writing, setWriting] = useState<WritingState | null>(null);
  const [input, setInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const labels = LABELS[datasetKey];

  const generateWriting = () => {
    const item = srs.pickWeighted();
    setWriting({ item, done: false, ok: null });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    generateWriting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, direction, datasetKey]);

  if (!writing) return null;

  // Her zaman: src = soru, dst = beklenen cevap
  const expected = writing.item.dst;
  const promptText = writing.item.src;

  const targetLabel = direction === "forward" ? labels.dst : labels.src; // sadece başlık
  const help = `Type the ${targetLabel} word or phrase.`;
  const title = `Translate to ${targetLabel}`;

  const ttsLang = direction === "forward" ? labels.ttsSrc : labels.ttsDst;

  // Hedef (dst) Rusça ise klavyeyi göster
  const showRuKeyboard = datasetKey === "tr_ru" && direction === "forward";

  const checkWriting = () => {
    if (!writing || writing.done) return;
    const ok = fuzzyEq(input, expected);
    onFinish(ok, writing.item.id);
    setWriting({ ...writing, done: true, ok });
  };

  const nextWriting = () => generateWriting();

  // Klavye tıklamaları
  const appendText = (t: string) => setInput((prev) => prev + t);
  const backspace = () => setInput((prev) => prev.slice(0, -1));

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
            onClick={() => speak(promptText, ttsLang)}
            title="Play pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <motion.div
          animate={
            writing.done && writing.ok === false
              ? { x: [0, -6, 6, -6, 6, 0] }
              : {}
          }
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type here..."
            onKeyDown={(e) => e.key === "Enter" && checkWriting()}
            disabled={writing.done}
          />
          <Button onClick={checkWriting} disabled={writing.done}>
            Check
          </Button>
          <Button variant="secondary" onClick={nextWriting}>
            Next
          </Button>
        </motion.div>

        {showRuKeyboard && !writing.done && (
          <VirtualKeyboard
            onText={appendText}
            onBackspace={backspace}
            onEnter={checkWriting}
            className="mt-2"
          />
        )}

        <div className="mt-3">
          {writing.done ? (
            <Feedback
              ok={!!writing.ok}
              correct={expected}
              hint={hint(input, expected)}
            />
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> {help}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
