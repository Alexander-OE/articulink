import { Router } from 'express';
import {
  createArticle,
  listArticles,
  searchArticles,
  trendingArticles,
  getArticleById,
  getArticleStats,
} from '../controllers/articles.controller.js';
import { requireAuth } from '../middleware/auth.js';


const router = Router();


/**
 * @openapi
 * /articles:
 *   post:
 *     tags: [Articles]
 *     summary: Create an article
 *     description: Requires a token. The author is the signed-in user's full name. If `summary` or `tags` are omitted, they are generated with Gemini AI (falling back to keyword extraction).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArticleInput'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', requireAuth, createArticle);

/**
 * @openapi
 * /articles:
 *   get:
 *     tags: [Articles]
 *     summary: List articles
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0, default: 0 }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: Filter by a single tag.
 *     responses:
 *       200:
 *         description: Paginated list of articles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedArticles'
 */
router.get('/', listArticles);

// Static paths must be registered before the dynamic ":id" route so they
// are not swallowed by it.

/**
 * @openapi
 * /articles/search:
 *   get:
 *     tags: [Articles]
 *     summary: Full-text search
 *     description: Searches titles, content, and tags, ranked by relevance score.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, minLength: 1, maxLength: 200 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0, default: 0 }
 *     responses:
 *       200:
 *         description: Ranked, paginated search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedArticles'
 *       400:
 *         description: Missing or invalid query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', searchArticles);

/**
 * @openapi
 * /articles/trending:
 *   get:
 *     tags: [Articles]
 *     summary: Trending articles
 *     description: Ranks articles by a weighted engagement score (share=5, like=3, view=1) over a time window.
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, minimum: 1, maximum: 365, default: 7 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *     responses:
 *       200:
 *         description: Trending articles with their scores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       article: { $ref: '#/components/schemas/Article' }
 *                       score: { type: integer, example: 24 }
 *                       views: { type: integer }
 *                       likes: { type: integer }
 *                       shares: { type: integer }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     days: { type: integer }
 *                     limit: { type: integer }
 */
router.get('/trending', trendingArticles);

/**
 * @openapi
 * /articles/{id}:
 *   get:
 *     tags: [Articles]
 *     summary: Get an article by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The article
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', getArticleById);

/**
 * @openapi
 * /articles/{id}/stats:
 *   get:
 *     tags: [Articles]
 *     summary: Engagement stats for an article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: View/like/share counts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArticleStats'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id/stats', getArticleStats);


export default router;
