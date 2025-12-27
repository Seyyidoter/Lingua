// src/lib/srs.ts
"use client";

import { useEffect, useState } from "react";
import type { Item } from "@/lib/types";

export type SRSApi = {
  state: Record<number, { mistakes: number; lastSeen: number }>;
  bump: (id: number, correct: boolean) => void;
  pickWeighted: () => Item;
};

export function useSRSState(key: string, items: Item[]): SRSApi {
  type SRS = Record<number, { mistakes: number; lastSeen: number }>;
  const [state, setState] = useState<SRS>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as SRS) : {};
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  const bump = (id: number, correct: boolean) => {
    setState(prev => {
      const curr = prev[id] || { mistakes: 0, lastSeen: 0 };
      const mistakes = Math.max(0, curr.mistakes + (correct ? -1 : 1));
      return { ...prev, [id]: { mistakes, lastSeen: Date.now() } };
    });
  };

  const pickWeighted = (): Item => {
    const now = Date.now();
    const weights = items.map(it => {
      const s = state[it.id] || { mistakes: 0, lastSeen: 0 };
      const elapsedSec = Math.max(1, (now - s.lastSeen) / 1000);
      const recencyFactor = Math.min(4, Math.log2(elapsedSec + 1));
      const base = 1 + s.mistakes;
      return { it, w: base * recencyFactor };
    });
    const total = weights.reduce((sum, x) => sum + x.w, 0);
    let r = Math.random() * total;
    for (const x of weights) {
      if ((r -= x.w) <= 0) return x.it;
    }
    return items[Math.floor(Math.random() * items.length)];
  };

  return { state, bump, pickWeighted };
}
