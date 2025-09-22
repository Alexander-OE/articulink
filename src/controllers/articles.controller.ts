import type { Request, Response } from "express";
import Article from "../models/Article.js";
import {
  createArticleSchema,
  getArticlesQuerySchema,
} from "../validators/articles.validator.js";
import { buildPaginationResponse } from "../utils/paginator.js";
import { generateSummary } from "../utils/generateSummary.js";


// POST /articles
export async function createArticle(req: Request, res: Response) {
  const { error, value } = createArticleSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({ error: error.details.map((d) => d.message) });
  }

  try {
    let { title, content, author, summary } = value;

    if (!summary || summary.trim() === "") {
      summary = await generateSummary(content);
    }

    const article = await Article.create({ title, content, author, summary });

    return res.status(201).json(article);
  } catch (err: any) {
    console.error("createArticle error", err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// GET /articles
export async function listArticles(req: Request, res: Response) {
  const { error, value } = getArticlesQuerySchema.validate(req.query, {
    stripUnknown: true,
  });
  if (error)
    return res.status(400).json({ error: error.details.map((d) => d.message) });

  const { limit, offset } = value;
  try {
    const [articles, total] = await Promise.all([
      Article.find().sort({ createdAt: -1 }).skip(offset).limit(limit).exec(),
      Article.countDocuments().exec(),
    ]);

    return res.json(buildPaginationResponse(articles, total, limit, offset));
  } catch (err) {
    console.error("listArticles error", err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// GET /articles/:id
export async function getArticleById(req: Request, res: Response) {
  const id = req.params.id;
  try {
    const article = await Article.findById(id).exec();
    if (!article) return res.status(404).json({ error: "not_found" });
    return res.json(article);
  } catch (err) {
    console.error("getArticleById error", err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}
