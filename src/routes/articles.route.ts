import { Router } from 'express';
import { createArticle, listArticles, getArticleById } from '../controllers/articles.controller.js';


const router = Router();


router.post('/', createArticle);
router.get('/', listArticles);
router.get('/:id', getArticleById);


export default router;