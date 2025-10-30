"use client";

import React from "react";
import { Check, X } from "lucide-react";
import type { DatasetKey } from "@/lib/types";

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
}: {
  ok: boolean;
  correct: string;
  hint?: string;
}) {
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
  value,
  onChange,
}: {
  value: DatasetKey;
  onChange: (v: DatasetKey) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Dataset</label>
      <select
        className="border rounded-md px-2 py-1 bg-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value as DatasetKey)}
    >
  <option value="en_tr">English → Turkish</option>
  <option value="tr_ru">Turkish → Russian</option>
</select>

    </div>
  );
}
