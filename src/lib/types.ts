// src/lib/types.ts
export type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type POS =
  | "noun" | "verb" | "adj" | "adv" | "prep" | "pron" | "det"
  | "conj" | "num" | "exclam" | "other" | "article" | "number" | "modal" | "aux";

export type TriEntry = {
  id: number;
  en: string;
  tr: string;
  ru: string;
  pos?: POS;
  level: CEFR;
};

export type Item = {
  id: number;
  src: string;
  dst: string;
  pos?: POS;
  level?: CEFR;
};

export type DatasetKey = "en_tr" | "tr_ru";
