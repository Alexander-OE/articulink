import { Router } from 'express';
import { createInteraction } from '../controllers/interactions.controller.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
/**
 * @openapi
 * /interactions:
 *   post:
 *     tags: [Interactions]
 *     summary: Record an interaction
 *     description: Requires a token. Records a view, like, or share by the signed-in user. The referenced article must exist.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InteractionInput'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Interaction' }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       400:
 *         description: Validation error or invalid id
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Referenced article not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', requireAuth, createInteraction);
export default router;
//# sourceMappingURL=interactions.route.js.map