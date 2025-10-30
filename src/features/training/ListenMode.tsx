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

type ListenState = { item: Item; done: boolean; ok: boolean | null };

export default function ListenMode({
  data,
  srs,
  onFinish,
}: {
  data: Item[];
  srs: SRSApi;
  onFinish: (ok: boolean, itemId: number) => void;
}) {
  const [lsn, setLsn] = useState<ListenState | null>(null);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const generate = () => {
    const item = srs.pickWeighted();
    setLsn({ item, done: false, ok: null });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
    setTimeout(() => speak(item.src, "en-US"), 50);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length]);

  if (!lsn) return null;

  const check = () => {
    if (!lsn || lsn.done) return;
    const ok = fuzzyEq(input, lsn.item.src);
    onFinish(ok, lsn.item.id);
    setLsn({ ...lsn, done: true, ok });
  };

  const next = () => generate();

  return (
    <Card className="backdrop-blur bg-white/40 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Listen & Type (EN)
          <Badge variant="secondary" className="ml-2">
            Hint (TR): {lsn.item.dst}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto"
            onClick={() => speak(lsn.item.src, "en-US")}
            title="Play pronunciation (EN)"
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
            placeholder="Type what you hear (English)…"
            onKeyDown={(e) => e.key === "Enter" && check()}
            disabled={lsn.done}
          />
          <Button onClick={check} disabled={lsn.done}>Check</Button>
          <Button variant="secondary" onClick={next}>Next</Button>
        </motion.div>

        <div className="mt-3">
          {lsn.done ? (
            <Feedback ok={!!lsn.ok} correct={lsn.item.src} hint={hint(input, lsn.item.src)} />
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Press the speaker, then type the English word/phrase.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
