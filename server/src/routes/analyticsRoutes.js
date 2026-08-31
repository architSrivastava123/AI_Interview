/**
 * analyticsRoutes.js
 * REST API routes for user readiness and performance analytics.
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAnalytics);

export default router;
