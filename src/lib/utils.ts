// Minimal utilities (no voice picker / caching)

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ------------------- String utils -------------------
export function levenshtein(a = "", b = ""): number {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[n][m];
}

export const eq = (a?: string, b?: string) =>
  (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

export const fuzzyEq = (a?: string, b?: string) => {
  const A = (a ?? "").trim().toLowerCase();
  const B = (b ?? "").trim().toLowerCase();
  return A === B || levenshtein(A, B) <= 1;
};

export const hint = (user?: string, target?: string) => {
  const u = (user || "").toLowerCase();
  const t = (target || "").toLowerCase();
  if (!u) return "";
  const d = levenshtein(u, t);
  if (d === 1) return "(almost there – 1 letter off)";
  if (d === 2) return "(close – 2 letters off)";
  return "";
};

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------- Simple TTS -------------------
export function speak(text: string, lang = "en-US") {
  try {
    if (typeof window === "undefined") return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    // dil bazlı küçük ayar (isteğe bağlı)
    if (lang.startsWith("tr")) u.rate = 0.95;
    if (lang.startsWith("ru")) u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // no-op
  }
}
