import Joi from "joi";
export const registerSchema = Joi.object({
    fullName: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().lowercase().email().max(254).required(),
    // bcrypt only uses the first 72 bytes, so a longer password adds no security.
    password: Joi.string().min(6).max(72).required(),
    interests: Joi.array().items(Joi.string()).optional(),
});
// Login only checks that both fields are present. Whether they are correct is
// decided by the login code, so the response never reveals which one was wrong.
export const loginSchema = Joi.object({
    email: Joi.string().trim().lowercase().required(),
    password: Joi.string().required(),
});
//# sourceMappingURL=auth.validator.js.map