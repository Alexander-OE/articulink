import jwt, {} from "jsonwebtoken";
function getJwtSecret() {
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
export function createToken(userId) {
    // For example "7d" or "12h". Defaults to seven days.
    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d");
    return jwt.sign({ userId }, getJwtSecret(), { expiresIn });
}
// Throws if the token is forged, malformed or expired.
export function readUserIdFromToken(token) {
    const payload = jwt.verify(token, getJwtSecret());
    if (typeof payload === "string" || typeof payload.userId !== "string") {
        throw new Error("Token does not contain a user id");
    }
    return payload.userId;
}
//# sourceMappingURL=token.js.map