/**
 * resumeController.js
 * Express controller for uploading, parsing, embedding, and managing candidate resumes.
 */

import { Resume } from '../models/Resume.js';
import { parsePdfBuffer, extractSkillsFromText, processResumeIntoChunks } from '../rag/loaders/pdfLoader.js';
import { batchGetEmbeddings } from '../rag/embeddings/embeddingService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * POST /api/resumes
 * Uploads and parses a PDF or text resume, extracts skills, generates vector chunk embeddings.
 */
export async function uploadResume(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    let rawText = req.body.rawText || '';
    let filename = req.body.filename || 'Uploaded Resume';
    let fileSize = 0;

    if (req.file) {
      filename = req.file.originalname;
      fileSize = req.file.size;
      if (req.file.mimetype === 'application/pdf') {
        rawText = await parsePdfBuffer(req.file.buffer);
      } else {
        rawText = req.file.buffer.toString('utf-8');
      }
    }

    if (!rawText || rawText.trim().length < 30) {
      throw new AppError('Resume content is too short or could not be parsed from file.', 400, 'INVALID_RESUME');
    }

    const parsedSkills = extractSkillsFromText(rawText);
    const chunkObjects = processResumeIntoChunks(rawText);

    // Generate embeddings for each chunk
    const chunkTexts = chunkObjects.map(c => c.text);
    const embeddings = await batchGetEmbeddings(chunkTexts);

    const chunksWithEmbeddings = chunkObjects.map((c, i) => ({
      text: c.text,
      chunkIndex: c.chunkIndex,
      section: c.section,
      embedding: embeddings[i] || [],
    }));

    const resume = await Resume.create({
      clerkUserId,
      filename,
      rawText,
      parsedSkills,
      targetRole: req.body.targetRole || 'General',
      chunks: chunksWithEmbeddings,
      fileSize,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: resume._id,
        filename: resume.filename,
        parsedSkills: resume.parsedSkills,
        targetRole: resume.targetRole,
        totalChunks: resume.chunks.length,
        createdAt: resume.createdAt,
      },
      message: 'Resume parsed and embedded successfully for RAG.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/resumes
 * Lists all resumes for authenticated user.
 */
export async function listResumes(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const resumes = await Resume.find({ clerkUserId })
      .select('-chunks.embedding')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/resumes/:id
 * Deletes a resume document.
 */
export async function deleteResume(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, clerkUserId });

    if (!resume) {
      throw new AppError('Resume not found.', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
