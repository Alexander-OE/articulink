import mongoose from "mongoose";
import Article from "../models/Article.js";
import Interaction from "../models/Interaction.js";
import { createArticleSchema, getArticlesQuerySchema, searchArticlesQuerySchema, trendingQuerySchema, } from "../validators/articles.validator.js";
import { buildPaginationResponse } from "../utils/paginator.js";
import { generateSummary } from "../utils/generateSummary.js";
import { generateTags } from "../utils/generateTags.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import { getAuthenticatedUser } from "../middleware/auth.js";
// POST /articles  (requires a token; the author is the signed-in user)
export const createArticle = asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req);
    const { error, value } = createArticleSchema.validate(req.body, {
        abortEarly: false,
    });
    if (error) {
        return res.status(400).json({ error: error.details.map((d) => d.message) });
    }
    let { title, content, summary, tags } = value;
    // Generate the summary and tags in parallel when the client omits them.
    const [resolvedSummary, resolvedTags] = await Promise.all([
        !summary || summary.trim() === "" ? generateSummary(content) : summary,
        !tags || tags.length === 0 ? generateTags(title, content) : tags,
    ]);
    const article = await Article.create({
        title,
        content,
        author: user.fullName,
        summary: resolvedSummary,
        tags: resolvedTags,
    });
    return res.status(201).json(article);
});
// GET /articles  (optionally filtered by ?tag=)
export const listArticles = asyncHandler(async (req, res) => {
    const { error, value } = getArticlesQuerySchema.validate(req.query, {
        stripUnknown: true,
    });
    if (error)
        return res.status(400).json({ error: error.details.map((d) => d.message) });
    const { limit, offset, tag } = value;
    const filter = tag ? { tags: tag } : {};
    const [articles, total] = await Promise.all([
        Article.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).exec(),
        Article.countDocuments(filter).exec(),
    ]);
    return res.json(buildPaginationResponse(articles, total, limit, offset));
});
// GET /articles/search?q=...
export const searchArticles = asyncHandler(async (req, res) => {
    const { error, value } = searchArticlesQuerySchema.validate(req.query, {
        stripUnknown: true,
    });
    if (error)
        return res.status(400).json({ error: error.details.map((d) => d.message) });
    const { q, limit, offset } = value;
    // Use the full-text index and rank results by relevance score.
    const query = { $text: { $search: q } };
    const projection = { score: { $meta: "textScore" } };
    const [articles, total] = await Promise.all([
        Article.find(query, projection)
            .sort({ score: { $meta: "textScore" } })
            .skip(offset)
            .limit(limit)
            .exec(),
        Article.countDocuments(query).exec(),
    ]);
    return res.json(buildPaginationResponse(articles, total, limit, offset));
});
// GET /articles/trending?days=&limit=
export const trendingArticles = asyncHandler(async (req, res) => {
    const { error, value } = trendingQuerySchema.validate(req.query, {
        stripUnknown: true,
    });
    if (error)
        return res.status(400).json({ error: error.details.map((d) => d.message) });
    const { limit, days } = value;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    // Rank articles by a weighted engagement score over the chosen window:
    // shares count most, then likes, then views.
    const results = await Interaction.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
            $group: {
                _id: "$articleId",
                score: {
                    $sum: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$interactionType", "like"] }, then: 3 },
                                { case: { $eq: ["$interactionType", "share"] }, then: 5 },
                            ],
                            default: 1,
                        },
                    },
                },
                views: {
                    $sum: { $cond: [{ $eq: ["$interactionType", "view"] }, 1, 0] },
                },
                likes: {
                    $sum: { $cond: [{ $eq: ["$interactionType", "like"] }, 1, 0] },
                },
                shares: {
                    $sum: { $cond: [{ $eq: ["$interactionType", "share"] }, 1, 0] },
                },
            },
        },
        { $sort: { score: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "articles",
                localField: "_id",
                foreignField: "_id",
                as: "article",
            },
        },
        { $unwind: "$article" },
        {
            $project: {
                _id: 0,
                article: 1,
                score: 1,
                views: 1,
                likes: 1,
                shares: 1,
            },
        },
    ]);
    return res.json({ data: results, meta: { days, limit } });
});
// GET /articles/:id
export const getArticleById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
        throw new AppError("invalid_id", 400);
    const article = await Article.findById(id).exec();
    if (!article)
        throw new AppError("not_found", 404);
    return res.json(article);
});
// GET /articles/:id/stats
export const getArticleStats = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
        throw new AppError("invalid_id", 400);
    const article = await Article.findById(id).select("_id").exec();
    if (!article)
        throw new AppError("not_found", 404);
    const grouped = await Interaction.aggregate([
        { $match: { articleId: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: "$interactionType", count: { $sum: 1 } } },
    ]);
    const stats = { views: 0, likes: 0, shares: 0, total: 0 };
    for (const row of grouped) {
        if (row._id === "view")
            stats.views = row.count;
        if (row._id === "like")
            stats.likes = row.count;
        if (row._id === "share")
            stats.shares = row.count;
    }
    stats.total = stats.views + stats.likes + stats.shares;
    return res.json({ articleId: id, stats });
});
//# sourceMappingURL=articles.controller.js.map