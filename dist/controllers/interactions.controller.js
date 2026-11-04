import mongoose from "mongoose";
import Interaction from "../models/Interaction.js";
import Article from "../models/Article.js";
import { createInteractionSchema } from "../validators/interactions.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import { getAuthenticatedUser } from "../middleware/auth.js";
// POST /interactions  (requires a token; the user is the signed-in user)
export const createInteraction = asyncHandler(async (req, res) => {
    const user = getAuthenticatedUser(req);
    const { error, value } = createInteractionSchema.validate(req.body, {
        abortEarly: false,
    });
    if (error)
        return res
            .status(400)
            .json({ error: error.details.map((d) => d.message) });
    if (!mongoose.isValidObjectId(value.article_id)) {
        throw new AppError("invalid_id", 400);
    }
    // Ensure the article actually exists before recording.
    const article = await Article.exists({ _id: value.article_id });
    if (!article)
        throw new AppError("article_not_found", 404);
    const inter = await Interaction.create({
        userId: user._id,
        articleId: value.article_id,
        interactionType: value.interaction_type,
    });
    return res.status(201).json(inter);
});
//# sourceMappingURL=interactions.controller.js.map