/**
 * recommendationRoutes.js
 * REST API routes for practice recommendations.
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listRecommendations, toggleRecommendation } from '../controllers/recommendationController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listRecommendations);
router.patch('/:id/toggle', toggleRecommendation);

export default router;
