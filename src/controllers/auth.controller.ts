import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { createToken } from "../utils/token.js";
import { getAuthenticatedUser } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// How much work bcrypt does per password. Higher is safer but slower; 10 is the usual default.
const PASSWORD_HASH_ROUNDS = 10;

// POST /auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error)
    return res.status(400).json({ error: error.details.map((d) => d.message) });

  const { fullName, email, password, interests } = value;
  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

  try {
    const user = await User.create({ fullName, email, passwordHash, interests });
    return res.status(201).json({ token: createToken(user.id), user });
  } catch (err: any) {
    // 11000 is MongoDB's "duplicate key" error: the unique email index fired.
    if (err.code === 11000) throw new AppError("email_already_registered", 409);
    throw err;
  }
});

// POST /auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error)
    return res.status(400).json({ error: error.details.map((d) => d.message) });

  // The hash is hidden by default, so ask for it explicitly.
  const user = await User.findOne({ email: value.email })
    .select("+passwordHash")
    .exec();
  const passwordIsCorrect = user
    ? await bcrypt.compare(value.password, user.passwordHash)
    : false;

  // Same error for "no such email" and "wrong password", so the response
  // never tells an attacker which email addresses have accounts.
  if (!user || !passwordIsCorrect) throw new AppError("invalid_credentials", 401);

  return res.json({ token: createToken(user.id), user });
});

// GET /auth/me  (requires a token)
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  return res.json(getAuthenticatedUser(req));
});
