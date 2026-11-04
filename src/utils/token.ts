import jwt, { type SignOptions } from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to your .env file.");
  }
  return secret;
}

// Called once at startup so a missing secret stops the server immediately,
// instead of failing later on the first login.
export function checkJwtSecretIsConfigured() {
  getJwtSecret();
}

// The token only carries the user's id. Everything else is looked up from the
// database on each request, so it is always up to date.
export function createToken(userId: string): string {
  // For example "7d" or "12h". Defaults to seven days.
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as NonNullable<SignOptions["expiresIn"]>;
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn });
}

// Throws if the token is forged, malformed or expired.
export function readUserIdFromToken(token: string): string {
  const payload = jwt.verify(token, getJwtSecret());
  if (typeof payload === "string" || typeof payload.userId !== "string") {
    throw new Error("Token does not contain a user id");
  }
  return payload.userId;
}
