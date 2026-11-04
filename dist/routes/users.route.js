import { Router } from "express";
import { getUserById, getUserActivity, getRecommendations, } from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
// Accounts are created with POST /auth/register (see auth.route.ts).
// Every route below needs a token, and the :id must be the signed-in user's own id.
/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get your own user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: The id is not the signed-in user's id (`forbidden`)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:id", requireAuth, getUserById);
/**
 * @openapi
 * /users/{id}/activity:
 *   get:
 *     tags: [Users]
 *     summary: Your recent interactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Recent interactions with populated article summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId: { type: string }
 *                 interactions:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Interaction' }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: The id is not the signed-in user's id (`forbidden`)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:id/activity", requireAuth, getUserActivity);
/**
 * @openapi
 * /users/{id}/recommendations:
 *   get:
 *     tags: [Users]
 *     summary: Your personalized article recommendations
 *     description: Built from your interests plus the tags of articles you've engaged with, excluding already-seen articles. Falls back to the newest unseen articles.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Recommended articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId: { type: string }
 *                 strategy:
 *                   type: string
 *                   enum: [personalized, fallback_recent]
 *                 matchedInterests:
 *                   type: array
 *                   items: { type: string }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Article' }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: The id is not the signed-in user's id (`forbidden`)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:id/recommendations", requireAuth, getRecommendations);
export default router;
//# sourceMappingURL=users.route.js.map