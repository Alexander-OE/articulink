import Joi from 'joi';


export const createUserSchema = Joi.object({
username: Joi.string().alphanum().min(3).max(30).required(),
interests: Joi.array().items(Joi.string()).optional(),
});