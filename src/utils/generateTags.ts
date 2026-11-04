import { GoogleGenerativeAI } from "@google/generative-ai";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for",
  "with", "at", "by", "from", "about", "as", "is", "are", "was", "were",
  "be", "this", "that", "these", "those", "it", "its", "how", "why", "what",
]);

function cleanTags(raw: string[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const candidate of raw) {
    const tag = candidate
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim();
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
    if (tags.length >= 6) break;
  }
  return tags;
}

// Naive keyword extraction used when the AI call is unavailable.
function fallbackTags(title: string, content: string): string[] {
  const words = `${title} ${content}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  return cleanTags(ranked);
}

/**
 * Generate 3–6 lowercase topical tags for an article using Gemini.
 * Falls back to frequency-based keyword extraction if the API key is
 * missing or the request fails, so article creation never breaks.
 */
export async function generateTags(
  title: string,
  content: string
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(
        `Read the article below and return 3 to 6 short topical tags that describe its subject. ` +
          `Respond with ONLY a comma-separated list of lowercase tags, no numbering or extra text.\n\n` +
          `Title: ${title}\n\nContent: ${content}`
      );

      const text = result.response.text().trim();
      const tags = cleanTags(text.split(","));
      if (tags.length > 0) return tags;
    } catch (err: any) {
      console.error("Gemini tag generation failed, using fallback:", err.message);
    }
  }

  return fallbackTags(title, content);
}
