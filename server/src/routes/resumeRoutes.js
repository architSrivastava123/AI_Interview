/**
 * resumeRoutes.js
 * REST API routes for uploading and managing resumes.
 */

import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { uploadResume, listResumes, deleteResume } from '../controllers/resumeController.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.use(requireAuth);

router.post('/', upload.single('resume'), uploadResume);
router.get('/', listResumes);
router.delete('/:id', deleteResume);

export default router;
