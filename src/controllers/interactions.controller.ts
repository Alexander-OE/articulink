import type { Request, Response } from "express";
import Interaction from "../models/Interaction.js";
import { createInteractionSchema } from "../validators/interactions.validator.js";


// POST /interactions
export async function createInteraction(req: Request, res: Response) {
  const { error, value } = createInteractionSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error)
    return res.status(400).json({ error: error.details.map((d) => d.message) });

  try {
    const inter = await Interaction.create({
      userId: value.user_id,
      articleId: value.article_id,
      interactionType: value.interaction_type,
    });
    return res.status(201).json(inter);
  } catch (err) {
    console.error("createInteraction error", err);
    return res.status(500).json({ error: "internal_server_error" });
  }
}
