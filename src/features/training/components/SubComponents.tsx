// features/training/components/SubComponents.tsx
"use client";

import React from "react";
// Info ikonu eklendi
import { Check, X, Info } from "lucide-react";
import type { DatasetKey, CEFR } from "@/lib/types";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

export function Feedback({
  ok,
  correct,
  hint,
  explanation // <--- Yeni prop
}: {
  ok: boolean;
  correct: string;
  hint?: string;
  explanation?: string | null; // <--- Tip tanımı
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-sm">
        {ok ? (
          <span className="text-green-600 flex items-center gap-1 font-medium">
            <Check className="w-4 h-4" /> Correct
          </span>
        ) : (
          <span className="text-red-600 flex items-center gap-1 font-medium">
            <X className="w-4 h-4" /> Correct: <b className="ml-1">{correct}</b>
          </span>
        )}
        {/* Eğer açıklama varsa ipucunu gizle, yoksa göster */}
        {hint && !explanation ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>

      {/* YENİ: AI Açıklama Kutusu */}
      {!ok && explanation && (
        <div className="flex gap-2 items-start bg-orange-50 border border-orange-100 text-orange-800 p-3 rounded-md text-xs animate-in fade-in slide-in-from-top-1">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{explanation}</span>
        </div>
      )}
    </div>
  );
}

export function DatasetPicker({
  value, onChange,
}: { value: DatasetKey; onChange: (v: DatasetKey) => void }) {
  return (
    <div className="flex items-center gap-2 bg-white/50 backdrop-blur rounded-lg px-2 py-1 border border-white/20">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">Pair</label>
      <select
        className="bg-transparent text-sm font-semibold focus:outline-none py-1 cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value as DatasetKey)}
      >
        <option value="en_tr">EN ↔ TR</option>
        <option value="tr_ru">TR ↔ RU</option>
      </select>
    </div>
  );
}

export function DirectionPicker({
  value, onChange, datasetKey,
}: {
  value: "forward" | "reverse";
  onChange: (v: "forward" | "reverse") => void;
  datasetKey: DatasetKey;
}) {
  const labels =
    datasetKey === "en_tr"
      ? { forward: "EN → TR", reverse: "TR → EN" }
      : { forward: "TR → RU", reverse: "RU → TR" };

  return (
    <div className="flex items-center gap-2 bg-white/50 backdrop-blur rounded-lg px-2 py-1 border border-white/20">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">Dir</label>
      <select
        className="bg-transparent text-sm font-semibold focus:outline-none py-1 cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value as "forward" | "reverse")}
      >
        <option value="forward">{labels.forward}</option>
        <option value="reverse">{labels.reverse}</option>
      </select>
    </div>
  );
}

export function LevelPicker({
  value,
  onChange,
}: {
  value: CEFR | "ALL";
  onChange: (v: CEFR | "ALL") => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/50 backdrop-blur rounded-lg px-2 py-1 border border-white/20">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">Level</label>
      <select
        className="bg-transparent text-sm font-semibold focus:outline-none py-1 cursor-pointer min-w-[3rem]"
        value={value}
        onChange={(e) => onChange(e.target.value as CEFR | "ALL")}
      >
        <option value="ALL">ALL</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
      </select>
    </div>
  );
}