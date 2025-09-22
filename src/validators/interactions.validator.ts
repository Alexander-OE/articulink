import Joi from 'joi';


export const createInteractionSchema = Joi.object({
user_id: Joi.string().required(),
article_id: Joi.string().required(),
interaction_type: Joi.string().valid('view', 'like', 'share').required(),
});