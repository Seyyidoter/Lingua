"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Volume2, Keyboard, Loader2 } from "lucide-react"; // Loader2 eklendi
import { motion } from "framer-motion";

import type { Item } from "@/lib/types";
import type { SRSApi } from "@/lib/srs";
import { fuzzyEq, hint, speak } from "@/lib/utils";
import { Feedback } from "./components/SubComponents";
import VirtualKeyboard from "./components/VirtualKeyboard";
import SentenceViewer from "@/components/ui/SentenceViewer";
import { verifyTranslation } from "@/app/actions";

type ListenState = { item: Item; done: boolean; ok: boolean | null };

const LABELS: Record<
  "en_tr" | "tr_ru",
  { src: string; dst: string; ttsSrc: string; ttsDst: string }
> = {
  en_tr: { src: "English", dst: "Turkish", ttsSrc: "en-US", ttsDst: "tr-TR" },
  tr_ru: { src: "Turkish", dst: "Russian", ttsSrc: "tr-TR", ttsDst: "ru-RU" },
};

export default function ListenMode({
  data,
  srs,
  onFinish,
  datasetKey,
  direction,
}: {
  data: Item[];
  srs: SRSApi;
  onFinish: (ok: boolean, itemId: number) => void;
  datasetKey: "en_tr" | "tr_ru";
  direction: "forward" | "reverse";
}) {
  const [lsn, setLsn] = useState<ListenState | null>(null);
  const [input, setInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  
  // YENİ STATE: AI Açıklaması
  const [explanation, setExplanation] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement | null>(null);

  const labels = LABELS[datasetKey];

  const speakTextOf = (it: Item) => it.src;
  const speakLang = direction === "forward" ? labels.ttsSrc : labels.ttsDst;

  const expectedOf = (it: Item) => it.dst;
  const hintTextOf = (it: Item) => it.src;
  const listenLangLabel = direction === "forward" ? labels.dst : labels.src;
  const showRuKeyboard = datasetKey === "tr_ru" && direction === "forward";

  // Dil isimlerini hesapla
  const sourceLangName = direction === "forward" ? labels.src : labels.dst;
  const targetLangName = direction === "forward" ? labels.dst : labels.src;

  const generate = () => {
    const item = srs.pickWeighted();
    setLsn({ item, done: false, ok: null });
    setInput("");
    setIsChecking(false);
    setExplanation(null); // Reset explanation
    setTimeout(() => inputRef.current?.focus(), 0);
    setTimeout(() => speak(speakTextOf(item), speakLang), 50);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, direction, datasetKey]);

  if (!lsn) return null;

  const expected = expectedOf(lsn.item);
  const title = `Listen & Translate`;
  const placeholder = `Type the ${listenLangLabel} translation…`;
  const helpText = `Listen to the audio, then type the ${listenLangLabel} meaning.`;
  
  const hintLabel = `Text (${sourceLangName})`;
  const hintText = hintTextOf(lsn.item);
  const dictationText = speakTextOf(lsn.item);

  const check = async () => {
    if (!lsn || lsn.done || isChecking) return;

    // 1. Hızlı Yerel Kontrol
    const localMatch = fuzzyEq(input, expected);

    if (localMatch) {
      onFinish(true, lsn.item.id);
      setLsn({ ...lsn, done: true, ok: true });
      return;
    }

    // 2. AI Kontrolü
    setIsChecking(true);

    const aiResult = await verifyTranslation(
      lsn.item.src,       
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
      onFinish(true, lsn.item.id);
      setLsn({ ...lsn, done: true, ok: true });
    } else {
      onFinish(false, lsn.item.id);
      setLsn({ ...lsn, done: true, ok: false });
    }
  };

  const next = () => generate();
  const appendText = (t: string) => setInput((v) => (v ? v + t : t));
  const backspace = () => setInput((v) => v.slice(0, -1));
  const submit = () => check();

  return (
    <Card className="backdrop-blur bg-white/40 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          {title}
          
          {lsn.item.pos && (
            <Badge variant="outline" className="border-sky-500/50 text-sky-700 bg-sky-50/50 uppercase text-[10px] tracking-wider">
              {lsn.item.pos}
            </Badge>
          )}

          <Badge variant="secondary" className="ml-2">
            {hintLabel}: {hintText}
          </Badge>
          
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto"
            onClick={() => speak(dictationText, speakLang)}
            title="Play pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <motion.div
          animate={
            lsn.done && lsn.ok === false ? { x: [0, -6, 6, -6, 6, 0] } : {}
          }
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && check()}
            disabled={lsn.done || isChecking}
          />
          
          <Button onClick={check} disabled={lsn.done || isChecking} className="min-w-[100px]">
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking
              </>
            ) : (
              "Check"
            )}
          </Button>

          <Button variant="secondary" onClick={next} disabled={isChecking}>
            Next
          </Button>
        </motion.div>

        {showRuKeyboard && !lsn.done && (
          <div className="mt-3">
            <VirtualKeyboard
              onText={appendText}
              onBackspace={backspace}
              onEnter={submit}
              className="max-w-full"
            />
          </div>
        )}

        <div className="mt-3">
          {lsn.done ? (
            <Feedback
              ok={!!lsn.ok}
              correct={expected}
              hint={hint(input, expected)}
              explanation={explanation} // <--- EKLENDİ
            />
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> {helpText}
            </span>
          )}
        </div>

        <div className="mt-4 border-t border-slate-200/50 pt-4">
           <SentenceViewer 
              word={lsn.item.src} 
              pos={lsn.item.pos} 
              level={lsn.item.level} 
              srcLang={sourceLangName}
              dstLang={targetLangName}
           />
        </div>

      </CardContent>
    </Card>
  );
}