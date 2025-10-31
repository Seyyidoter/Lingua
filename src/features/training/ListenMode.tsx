"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Volume2, Keyboard } from "lucide-react";
import { motion } from "framer-motion";

import type { Item } from "@/lib/types";
import type { SRSApi } from "@/lib/srs";
import { fuzzyEq, hint, speak } from "@/lib/utils";
import { Feedback } from "./components/SubComponents";
import VirtualKeyboard from "./components/VirtualKeyboard"; 

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
  direction: "forward" | "reverse"; // forward: src->dst (hedefi dinle & yaz)
}) {
  const [lsn, setLsn] = useState<ListenState | null>(null);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const labels = LABELS[datasetKey];

  // Listen&Type: DIKTE + BEKLENEN = HEP HEDEF DİL
  const speakTextOf = (it: Item) => (direction === "forward" ? it.dst : it.src);
  const speakLang = direction === "forward" ? labels.ttsDst : labels.ttsSrc;
  const expectedOf = (it: Item) => (direction === "forward" ? it.dst : it.src);
  const hintTextOf = (it: Item) => (direction === "forward" ? it.src : it.dst);
  const listenLangLabel = direction === "forward" ? labels.dst : labels.src;

  // RU hedefleniyorsa klavyeyi aç
  const showRuKeyboard = datasetKey === "tr_ru" && direction === "forward";

  const generate = () => {
    const item = srs.pickWeighted();
    setLsn({ item, done: false, ok: null });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
    setTimeout(() => speak(speakTextOf(item), speakLang), 50);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, direction, datasetKey]);

  if (!lsn) return null;

  const expected = expectedOf(lsn.item);
  const title = `Listen & Type (${listenLangLabel.slice(0, 2).toUpperCase()})`;
  const placeholder = `Type what you hear (${listenLangLabel})…`;
  const helpText = `Press the speaker, then type the ${listenLangLabel} word/phrase.`;
  const hintLabel = `Hint (${direction === "forward" ? labels.src : labels.dst})`;
  const hintText = hintTextOf(lsn.item);

  const dictationText = speakTextOf(lsn.item);

  const check = () => {
    if (!lsn || lsn.done) return;
    const ok = fuzzyEq(input, expected);
    onFinish(ok, lsn.item.id);
    setLsn({ ...lsn, done: true, ok });
  };

  const next = () => generate();

  // ---- Sanal klavye callback'leri ----
  const appendText = (t: string) => setInput((v) => (v ? v + t : t));
  const backspace = () => setInput((v) => v.slice(0, -1));
  const submit = () => check();

  return (
    <Card className="backdrop-blur bg-white/40 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
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
          animate={lsn.done && lsn.ok === false ? { x: [0, -6, 6, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && check()}
            disabled={lsn.done}
          />
          <Button onClick={check} disabled={lsn.done}>
            Check
          </Button>
          <Button variant="secondary" onClick={next}>
            Next
          </Button>
        </motion.div>

        {/* RU hedefleniyorsa sanal klavye */}
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
            <Feedback ok={!!lsn.ok} correct={expected} hint={hint(input, expected)} />
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> {helpText}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
