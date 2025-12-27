// src/hooks/useStreak.ts
"use client";

import { useState, useEffect } from "react";

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [hasPracticedToday, setHasPracticedToday] = useState(false);

  // Helper: Tarihi YYYY-MM-DD formatına çevir (Saat farkını yoksaymak için)
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  useEffect(() => {
    // Sayfa açılınca localStorage'dan veriyi çek
    const storedStreak = Number(localStorage.getItem("lingua.streak") || 0);
    const lastDate = localStorage.getItem("lingua.lastDate");
    const today = getTodayString();

    setStreak(storedStreak);
    if (lastDate === today) {
      setHasPracticedToday(true);
    }
  }, []);

  const updateStreak = () => {
    const today = getTodayString();
    const lastDate = localStorage.getItem("lingua.lastDate");

    // Zaten bugün pratik yaptıysa işlem yapma
    if (lastDate === today) return;

    let newStreak = 1;
    const storedStreak = Number(localStorage.getItem("lingua.streak") || 0);

    if (lastDate) {
      // Dünün tarihini bul
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterday = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

      if (lastDate === yesterday) {
        // Eğer son pratik dündü ise seriyi arttır
        newStreak = storedStreak + 1;
      } else {
        // Eğer dün değilse (zincir koptuysa), 1'den başla (zaten newStreak=1)
      }
    }

    // State ve LocalStorage güncelle
    setStreak(newStreak);
    setHasPracticedToday(true);
    localStorage.setItem("lingua.streak", String(newStreak));
    localStorage.setItem("lingua.lastDate", today);
  };

  return { streak, hasPracticedToday, updateStreak };
}