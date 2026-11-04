import type { Request, Response } from "express";
import mongoose from "mongoose";
import Article, { type IArticle } from "../models/Article.js";
import type { IUser } from "../models/User.js";
import Interaction from "../models/Interaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import { getAuthenticatedUser } from "../middleware/auth.js";

// All /users/:id routes require a token, and a user may only see their own data.
// Returns the signed-in user once the id in the URL has been checked.
function getSignedInUserForRequestedId(req: Request): IUser {
  const requestedId = req.params.id;
  if (!mongoose.isValidObjectId(requestedId)) throw new AppError("invalid_id", 400);

  const user = getAuthenticatedUser(req);
  if (user.id !== requestedId) throw new AppError("forbidden", 403);
  return user;
}

// GET /users/:id
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = getSignedInUserForRequestedId(req);
  return res.json(user);
});

// GET /users/:id/activity
export const getUserActivity = asyncHandler(async (req: Request, res: Response) => {
  const user = getSignedInUserForRequestedId(req);

  const interactions = await Interaction.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("articleId", "title author tags")
    .exec();

  return res.json({ userId: user.id, interactions });
});

// GET /users/:id/recommendations
export const getRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getSignedInUserForRequestedId(req);

    const limit = 10;

    // Articles the user has already interacted with — excluded from results.
    const seen = await Interaction.distinct("articleId", { userId: user._id });

    // Build an interest profile from the user's stated interests plus the
    // tags of articles they have engaged with.
    const engaged = await Article.find({ _id: { $in: seen } })
      .select("tags")
      .exec();

    const tagSet = new Set<string>(user.interests ?? []);
    for (const article of engaged) {
      for (const tag of article.tags ?? []) tagSet.add(tag);
    }

    let recommendations: IArticle[] = [];
    let strategy = "personalized";

    if (tagSet.size > 0) {
      recommendations = await Article.find({
        tags: { $in: [...tagSet] },
        _id: { $nin: seen },
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    }

    // Cold-start fallback: no profile or no matches yet → newest unseen articles.
    if (recommendations.length === 0) {
      strategy = "fallback_recent";
      recommendations = await Article.find({ _id: { $nin: seen } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    }

    return res.json({
      userId: user.id,
      strategy,
      matchedInterests: [...tagSet],
      data: recommendations,
    });
  }
);
