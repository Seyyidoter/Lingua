// src/lib/datasets/index.ts
import type { TriEntry, CEFR } from "@/lib/types";
import { OXFORD_A1 } from "./oxford_a1";
import { OXFORD_A2 } from "./oxford_a2";
import { OXFORD_B1 } from "./oxford_b1";
import { OXFORD_B2 } from "./oxford_b2";
import { OXFORD_C1 } from "./oxford_c1";

const BASE: Record<CEFR, number> = {
  A1: 0,
  A2: 1000,
  B1: 2000,
  B2: 3000,
  C1: 4000,
  C2: 5000,
};

// 🔧 düzeltme: ReadonlyArray kabul etsin
function normalize(list: ReadonlyArray<TriEntry>, level: CEFR): TriEntry[] {
  const base = BASE[level];
  return list.map(e => ({
    ...e,
    id: base + e.id,
    level,
  }));
}

export const OXFORD3K: TriEntry[] = [
  ...normalize(OXFORD_A1, "A1"),
  ...normalize(OXFORD_A2, "A2"),
  ...normalize(OXFORD_B1, "B1"),
  ...normalize(OXFORD_B2, "B2"),
  ...normalize(OXFORD_C1, "C1"),
];
