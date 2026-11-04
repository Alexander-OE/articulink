import Joi from 'joi';
export const createInteractionSchema = Joi.object({
    article_id: Joi.string().required(),
    interaction_type: Joi.string().valid('view', 'like', 'share').required(),
});
//# sourceMappingURL=interactions.validator.js.map