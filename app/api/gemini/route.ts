import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("ERRORE CRITICO: GEMINI_API_KEY mancante.");
      return NextResponse.json({ error: "Configurazione Gemini mancante." }, { status: 500 });
    }

    const { prompt, history } = await req.json();

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history ? [...history, { role: "user", parts: [{ text: prompt }] }] : prompt,
    });

    const response = await model;
    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    return NextResponse.json({ error: "Errore durante la chiamata a Gemini.", details: error.message }, { status: 500 });
  }
}
