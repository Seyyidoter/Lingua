// src/app/actions.ts
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

// Eğer anahtar yoksa hata vermemesi için boş kontrolü yapıyoruz
const genAI = new GoogleGenerativeAI(apiKey || "");

// 1. Cümle Örneği Getiren Fonksiyon
export async function getExampleSentence(
  word: string,
  pos: string,
  level: string,
  srcLang: string,
  dstLang: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      Create a simple, short example sentence in ${srcLang} (level ${level}) using the word "${word}" (${pos}).
      Also provide its translation in ${dstLang}.
      Return ONLY a JSON object with these exact keys: 
      { "original": "...", "translated": "..." }
      Do not add markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini API Error (Example):", error);
    return null;
  }
}

// 2. Çeviri Kontrolü Yapan Fonksiyon (GÜNCEL)
export async function verifyTranslation(
  srcWord: string,
  userAnswer: string,
  expectedAnswer: string,
  srcLang: string,
  dstLang: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      Act as a helpful language teacher.
      I asked a student to translate the word "${srcWord}" from ${srcLang} to ${dstLang}.
      The official dictionary answer is "${expectedAnswer}".
      The student wrote: "${userAnswer}".

      1. Is the student's answer correct? (Accept synonyms and minor typos).
      2. If it is WRONG, provide a very short explanation (max 1 sentence) in ${srcLang} explaining the mistake.
      3. If it is CORRECT, explanation should be null.

      Return ONLY a JSON object: 
      { "isCorrect": boolean, "explanation": string | null }
      Do not add markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gemini API Error (Verify):", error);
    return { isCorrect: false, explanation: "AI verification failed." };
  }
}