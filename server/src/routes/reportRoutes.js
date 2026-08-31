/**
 * reportRoutes.js
 * REST API routes for interview reports.
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listReports, getReportById } from '../controllers/reportController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listReports);
router.get('/:id', getReportById);

export default router;
