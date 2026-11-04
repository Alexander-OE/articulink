import type { Request, Response, NextFunction } from "express";
import User, { type IUser } from "../models/User.js";
import { readUserIdFromToken } from "../utils/token.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "./errorHandler.js";

// Lets TypeScript know that requireAuth adds the signed-in user to the request.
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Expects the header:  Authorization: Bearer <token>
function getBearerToken(request: Request): string {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("missing_token", 401);
  }
  return header.slice("Bearer ".length);
}

async function findUserFromToken(token: string): Promise<IUser> {
  let userId: string;
  try {
    userId = readUserIdFromToken(token);
  } catch {
    // Forged, malformed and expired tokens all look the same to the client.
    throw new AppError("invalid_token", 401);
  }

  // The user may have been deleted since the token was issued.
  const user = await User.findById(userId).exec();
  if (!user) throw new AppError("invalid_token", 401);
  return user;
}

// Put this in front of any route that needs to know who is calling it.
export const requireAuth = asyncHandler(
  async (request: Request, _response: Response, next: NextFunction) => {
    const token = getBearerToken(request);
    request.user = await findUserFromToken(token);
    next();
  }
);

// Controllers use this to read the signed-in user. It can only be called on
// routes that use requireAuth, but the check keeps TypeScript (and us) honest.
export function getAuthenticatedUser(request: Request): IUser {
  if (!request.user) throw new AppError("missing_token", 401);
  return request.user;
}
