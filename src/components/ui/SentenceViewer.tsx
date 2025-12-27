// features/training/components/SentenceViewer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2 } from "lucide-react";
import { getExampleSentence } from "@/app/actions";

type Props = {
  word: string;
  pos?: string;
  level?: string;
  srcLang: string; // Örn: "Russian"
  dstLang: string; // Örn: "Turkish"
};

// Basit bir dil -> bayrak eşleştirici
const getFlag = (lang: string) => {
  const l = lang.toLowerCase();
  if (l.includes("english")) return "🇬🇧";
  if (l.includes("turkish")) return "🇹🇷";
  if (l.includes("russian")) return "🇷🇺";
  return "🏳️";
};

export default function SentenceViewer({ word, pos, level, srcLang, dstLang }: Props) {
  // Veri yapısı: { original, translated }
  const [data, setData] = useState<{ original: string; translated: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Cache anahtarını dile göre özelleştir
  const cacheKey = `sentence_${srcLang}_${word}`;

  useEffect(() => {
    setIsOpen(false);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setData(JSON.parse(cached));
    } else {
      setData(null);
    }
  }, [word, srcLang, cacheKey]);

  const handleFetch = async () => {
    setIsOpen(true);
    if (data || loading) return;

    setLoading(true);
    // Yeni parametreleri gönderiyoruz
    const result = await getExampleSentence(word, pos || "", level || "A1", srcLang, dstLang);
    setLoading(false);

    if (result) {
      setData(result);
      localStorage.setItem(cacheKey, JSON.stringify(result));
    }
  };

  return (
    <div className="mt-4">
      {!isOpen ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleFetch}
          className="text-yellow-600 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          Show Example ({srcLang})
        </Button>
      ) : (
        <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 text-sm relative animate-in fade-in slide-in-from-top-2">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Generating AI Example...
            </div>
          ) : data ? (
            <div>
              <p className="text-slate-800 font-medium">
                {getFlag(srcLang)} {data.original}
              </p>
              <p className="text-slate-500 italic mt-1">
                {getFlag(dstLang)} {data.translated}
              </p>
            </div>
          ) : (
            <p className="text-red-400 text-xs">Could not load example.</p>
          )}
        </div>
      )}
    </div>
  );
}