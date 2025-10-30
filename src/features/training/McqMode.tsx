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

type MCQState = { item: Item; options: string[]; chosen: string | null; done: boolean };

export default function McqMode({
  data,
  srs,
  onFinish,
}: {
  data: Item[];
  srs: SRSApi;
  onFinish: (ok: boolean, itemId: number) => void;
}) {
  const [mcq, setMcq] = useState<MCQState | null>(null);

  const generateMCQ = () => {
    const item = srs.pickWeighted();
    const wrongs = shuffle(data.filter(d => d.id !== item.id).map(d => d.dst)).slice(0, 3);
    const options = shuffle([item.dst, ...wrongs]);
    setMcq({ item, options, chosen: null, done: false });
  };

  useEffect(() => {
    generateMCQ();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length]);

  const chooseMCQ = (opt: string) => {
    if (!mcq || mcq.done) return;
    const ok = eq(mcq.item.dst, opt);
    onFinish(ok, mcq.item.id);
    setMcq({ ...mcq, chosen: opt, done: true });
  };

  const nextMCQ = () => generateMCQ();

  if (!mcq) return null;

  return (
    <Card className="backdrop-blur bg-white/40 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Translate to Turkish
          <Badge variant="secondary" className="ml-2">
            {mcq.item.src}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto"
            onClick={() => speak(mcq.item.src, "en-US")}
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
            const isCorrect = eq(opt, mcq.item.dst);
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
            <Feedback ok={eq(mcq.chosen || "", mcq.item.dst)} correct={mcq.item.dst} />
          ) : (
            <span className="text-sm text-muted-foreground">
              Choose the correct translation.
            </span>
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
