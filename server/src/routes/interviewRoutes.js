/**
 * interviewRoutes.js
 * REST API routes for mock interview lifecycle.
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createInterview,
  listInterviews,
  getInterviewById,
  deleteInterview,
  startInterview,
  submitAnswer,
  nextQuestion,
  completeInterview,
} from '../controllers/interviewController.js';

const router = express.Router();

// Apply Clerk auth middleware to all interview routes
router.use(requireAuth);

router.post('/', createInterview);
router.get('/', listInterviews);
router.get('/:id', getInterviewById);
router.delete('/:id', deleteInterview);

router.post('/:id/start', startInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/next-question', nextQuestion);
router.post('/:id/complete', completeInterview);

export default router;
