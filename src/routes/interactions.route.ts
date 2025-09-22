import { Router } from 'express';
import { createInteraction } from '../controllers/interactions.controller.js';


const router = Router();
router.post('/', createInteraction);
export default router;