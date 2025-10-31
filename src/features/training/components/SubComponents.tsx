// features/training/components/SubComponents.tsx
"use client";

import React from "react";
import { Check, X } from "lucide-react";
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
  ok, correct, hint,
}: { ok: boolean; correct: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {ok ? (
        <span className="text-green-600 flex items-center gap-1">
          <Check className="w-4 h-4" /> Correct
        </span>
      ) : (
        <span className="text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" /> Correct: <b className="ml-1">{correct}</b>
        </span>
      )}
      {hint ? <span className="text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function DatasetPicker({
  value, onChange,
}: { value: DatasetKey; onChange: (v: DatasetKey) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Pair</label>
      <select
        className="border rounded-md px-2 py-1 bg-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value as DatasetKey)}
      >
        <option value="en_tr">English ↔ Turkish</option>
        <option value="tr_ru">Turkish ↔ Russian</option>
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
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Direction</label>
      <select
        className="border rounded-md px-2 py-1 bg-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value as "forward" | "reverse")}
      >
        <option value="forward">{labels.forward}</option>
        <option value="reverse">{labels.reverse}</option>
      </select>
    </div>
  );
}

/** CEFR seviye seçici */
export function LevelPicker({
  value, onChange,
}: {
  value: CEFR | "ALL";
  onChange: (v: CEFR | "ALL") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Level</label>
      <select
        className="border rounded-md px-2 py-1 bg-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value as CEFR | "ALL")}
      >
        <option value="ALL">ALL</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
        <option value="C2">C2</option>
      </select>
    </div>
  );
}
