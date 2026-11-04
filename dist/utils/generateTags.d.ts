/**
 * Generate 3–6 lowercase topical tags for an article using Gemini.
 * Falls back to frequency-based keyword extraction if the API key is
 * missing or the request fails, so article creation never breaks.
 */
export declare function generateTags(title: string, content: string): Promise<string[]>;
//# sourceMappingURL=generateTags.d.ts.map