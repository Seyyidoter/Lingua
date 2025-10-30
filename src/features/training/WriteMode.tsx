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

type WritingState = { item: Item; done: boolean; ok: boolean | null };

export default function WriteMode({
  data,
  srs,
  onFinish,
}: {
  data: Item[];
  srs: SRSApi;
  onFinish: (ok: boolean, itemId: number) => void;
}) {
  const [writing, setWriting] = useState<WritingState | null>(null);
  const [input, setInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const generateWriting = () => {
    const item = srs.pickWeighted();
    setWriting({ item, done: false, ok: null });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    generateWriting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length]);

  const checkWriting = () => {
    if (!writing || writing.done) return;
    const ok = fuzzyEq(input, writing.item.src);
    onFinish(ok, writing.item.id);
    setWriting({ ...writing, done: true, ok });
  };

  const nextWriting = () => generateWriting();

  if (!writing) return null;

  return (
    <Card className="backdrop-blur bg-white/40 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Translate to English
          <Badge variant="secondary" className="ml-2">
            {writing.item.dst}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto"
            onClick={() => speak(writing.item.dst, "tr-TR")}
            title="Play pronunciation (TR)"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <motion.div
          animate={
            writing.done && writing.ok === false
              ? { x: [0, -6, 6, -6, 6, 0] } // "shake" animasyonu
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

        <div className="mt-3">
          {writing.done ? (
            <Feedback
              ok={!!writing.ok}
              correct={writing.item.src}
              hint={hint(input, writing.item.src)}
            />
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Type the English word or phrase.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
