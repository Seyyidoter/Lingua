"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Delete,
  CornerDownLeft,
} from "lucide-react";

type Props = {
  onText: (t: string) => void;
  onBackspace: () => void;
  onEnter?: () => void;
  className?: string;
};

/* ——— Rusça düzen (lowercase) ——— */
const ROWS_LOWER: string[][] = [
  ["ё", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ"],
  ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю", "."],
];

const toUpper = (rows: string[][]) =>
  rows.map((r) => r.map((k) => (k.length === 1 ? k.toUpperCase() : k)));

export default function VirtualKeyboard({
  onText,
  onBackspace,
  onEnter,
  className,
}: Props) {
  const [upper, setUpper] = useState(false);
  const rows = useMemo(() => (upper ? toUpper(ROWS_LOWER) : ROWS_LOWER), [upper]);

  return (
    <div
      className={[
        "rounded-2xl border shadow-xl",
        "bg-white/60 backdrop-blur-sm",
        "p-3 md:p-4",
        className || "",
      ].join(" ")}
    >
      {/* Üst kontrol çubuğu */}
      <div className="mb-2 flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setUpper((v) => !v)}
          className={[
            "rounded-xl px-3",
            upper ? "ring-2 ring-sky-400" : "",
          ].join(" ")}
          title="Shift"
        >
          {upper ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
          <span className="ml-1 hidden sm:inline">Shift</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onBackspace}
          className="rounded-xl px-3"
          title="Backspace"
        >
          <Delete className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Backspace</span>
        </Button>

        <div className="ml-auto text-[11px] sm:text-xs text-muted-foreground">
          Virtual Russian Keyboard
        </div>
      </div>

      {/* Satırlar */}
      <div className="space-y-2">
        {/* 1. satır */}
        <Row>
          {rows[0].map((k) => (
            <Key key={k} label={k} onClick={() => onText(k)} />
          ))}
        </Row>

        {/* 2. satır */}
        <Row indent="md">
          {rows[1].map((k) => (
            <Key key={k} label={k} onClick={() => onText(k)} />
          ))}
        </Row>

        {/* 3. satır */}
        <Row indent="lg">
          {rows[2].map((k) => (
            <Key key={k} label={k} onClick={() => onText(k)} />
          ))}
        </Row>

        {/* 4. satır + Space + Enter */}
        <Row>
          {rows[3].map((k) => (
            <Key key={k} label={k} onClick={() => onText(k)} />
          ))}

          {/* Space */}
          <Key
            wide
            label="Space"
            onClick={() => onText(" ")}
            ariaLabel="Space"
          />

          {/* Enter */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onEnter}
            className={[
              "h-10 md:h-11 px-4 md:px-5",
              "rounded-xl font-medium",
              "bg-black text-white",
              "shadow-[inset_0_-2px_0_rgba(255,255,255,0.12)]",
            ].join(" ")}
            title="Enter"
          >
            <div className="flex items-center gap-2">
              <CornerDownLeft className="w-4 h-4" />
              <span>Enter</span>
            </div>
          </motion.button>
        </Row>
      </div>
    </div>
  );
}

/* ——— Yardımcı alt bileşenler ——— */

function Row({
  children,
  indent,
}: {
  children: React.ReactNode;
  indent?: "md" | "lg";
}) {
  // satır girdisi efekti
  const pad = indent === "lg" ? "pl-6 sm:pl-10" : indent === "md" ? "pl-4 sm:pl-6" : "";
  return <div className={`flex flex-wrap items-center gap-2 ${pad}`}>{children}</div>;
}

function Key({
  label,
  onClick,
  wide,
  ariaLabel,
}: {
  label: string;
  onClick: () => void;
  wide?: boolean;
  ariaLabel?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={[
        "h-10 md:h-11 min-w-9 md:min-w-10 px-3 md:px-3.5",
        "rounded-xl text-[15px] md:text-base font-medium",
        "bg-white shadow-sm",
        "border border-slate-200",
        "hover:shadow-md hover:bg-slate-50",
        "active:shadow-inner",
        "transition-[box-shadow,background-color] duration-150",
        wide ? "flex-1 text-left pl-5 pr-5" : "",
      ].join(" ")}
    >
      {wide ? (
        <span className="w-full text-center text-slate-600">Space</span>
      ) : (
        label
      )}
    </motion.button>
  );
}
