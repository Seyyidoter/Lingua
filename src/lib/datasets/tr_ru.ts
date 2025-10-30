// src/lib/datasets/tr_ru.ts
import { DatasetKey, Item } from "@/lib/types";

export const DATASETS: Record<DatasetKey, Item[]> = {
  tr_ru: [
    { id: 1, src: "elma", dst: "яблоко", pos: "noun" },
    { id: 2, src: "ekmek", dst: "хлеб", pos: "noun" },
    { id: 3, src: "su", dst: "вода", pos: "noun" },
    { id: 4, src: "yemek", dst: "есть", pos: "verb" },
    { id: 5, src: "içmek", dst: "пить", pos: "verb" },
    { id: 6, src: "kedi", dst: "кот", pos: "noun" },
    { id: 7, src: "köpek", dst: "собака", pos: "noun" },
    { id: 8, src: "ev", dst: "дом", pos: "noun" },
    { id: 9, src: "büyük", dst: "большой", pos: "adj" },
    { id: 10, src: "küçük", dst: "маленький", pos: "adj" },
  ],
};
