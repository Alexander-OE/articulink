import Joi from 'joi';
export const listQuerySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
});
//# sourceMappingURL=users.validator.js.map