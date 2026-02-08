"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Volume2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import type { Item } from "@/lib/types";
import type { SRSApi } from "@/lib/srs";
import { fuzzyEq, hint, speak } from "@/lib/utils";
import { Feedback } from "./components/SubComponents";
import VirtualKeyboard from "./components/VirtualKeyboard";
import SentenceViewer from "@/components/ui/SentenceViewer";
import { verifyTranslation } from "@/app/actions";

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
  const [isChecking, setIsChecking] = useState(false);

  // YENİ STATE: AI Açıklaması
  const [explanation, setExplanation] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const labels = LABELS[datasetKey];

  const generateWriting = () => {
    const item = srs.pickWeighted();
    setWriting({ item, done: false, ok: null });
    setInput("");
    setIsChecking(false);
    setExplanation(null); // Reset explanation
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    generateWriting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, direction, datasetKey]);

  if (!writing) return null;

  const expected = writing.item.dst;
  const promptText = writing.item.src;

  const targetLabel = direction === "forward" ? labels.dst : labels.src;
  const help = `Type the ${targetLabel} word or phrase.`;
  const title = `Translate to ${targetLabel}`;

  const ttsLang = direction === "forward" ? labels.ttsSrc : labels.ttsDst;
  const showRuKeyboard = datasetKey === "tr_ru" && direction === "forward";

  const sourceLangName = direction === "forward" ? labels.src : labels.dst;
  const targetLangName = direction === "forward" ? labels.dst : labels.src;

  const checkWriting = async () => {
    if (!writing || writing.done || isChecking) return;

    // 1. Hızlı Yerel Kontrol
    const localMatch = fuzzyEq(input, expected);

    if (localMatch) {
      onFinish(true, writing.item.id);
      setWriting({ ...writing, done: true, ok: true });
      return;
    }

    // 2. AI Kontrolü
    setIsChecking(true);

    const aiResult = await verifyTranslation(
      writing.item.src,
      input,
      expected,
      sourceLangName,
      targetLangName
    );

    setIsChecking(false);

    // AI açıklama döndürdüyse kaydet
    if (aiResult?.explanation) {
      setExplanation(aiResult.explanation);
    }

    if (aiResult?.isCorrect) {
      onFinish(true, writing.item.id);
      setWriting({ ...writing, done: true, ok: true });
    } else {
      onFinish(false, writing.item.id);
      setWriting({ ...writing, done: true, ok: false });
    }
  };

  const nextWriting = () => generateWriting();
  const appendText = (t: string) => setInput((prev) => prev + t);
  const backspace = () => setInput((prev) => prev.slice(0, -1));

  return (
    <Card className="backdrop-blur bg-white/40 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          {title}

          {writing.item.pos && (
            <Badge variant="outline" className="border-sky-500/50 text-sky-700 bg-sky-50/50 uppercase text-[10px] tracking-wider">
              {writing.item.pos}
            </Badge>
          )}

          {writing.item.level && (
            <Badge variant="outline" className="ml-2 border-purple-500/50 text-purple-700 bg-purple-50/50 uppercase text-[10px] tracking-wider font-bold">
              {writing.item.level}
            </Badge>
          )}

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
            disabled={writing.done || isChecking}
          />

          <Button onClick={checkWriting} disabled={writing.done || isChecking} className="min-w-[100px]">
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking
              </>
            ) : (
              "Check"
            )}
          </Button>

          <Button variant="secondary" onClick={nextWriting} disabled={isChecking}>
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
              explanation={explanation} // <--- EKLENDİ
            />
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> {help}
            </span>
          )}
        </div>

        <div className="mt-4 border-t border-slate-200/50 pt-4">
          <SentenceViewer
            word={writing.item.src}
            pos={writing.item.pos}
            level={writing.item.level}
            srcLang={sourceLangName}
            dstLang={targetLangName}
          />
        </div>

      </CardContent>
    </Card>
  );
}