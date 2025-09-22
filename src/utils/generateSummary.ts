// src/services/summary.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateSummary(content: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(
        `Summarize this article in 2–3 concise sentences:\n\n${content}`
      );

      const text = result.response.text();
      return text.trim();
    } catch (err: any) {
      console.error("Gemini API failed, using fallback:", err.message);
    }
  }

  // fallback text
  return content.split(" ").slice(0, 50).join(" ") + "...";
}
