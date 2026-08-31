/**
 * reportController.js
 * Express controller for querying and retrieving candidate interview reports.
 */

import { Report } from '../models/Report.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * GET /api/reports
 * Returns list of completed interview reports for the authenticated user.
 */
export async function listReports(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const reports = await Report.find({ clerkUserId })
      .sort({ createdAt: -1 })
      .populate('interviewId', 'targetRole experience interviewType completedAt')
      .lean();

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/:id
 * Fetches a single detailed report by report ID or interview ID.
 */
export async function getReportById(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const report = await Report.findOne({
      $or: [{ _id: req.params.id }, { interviewId: req.params.id }],
      clerkUserId,
    })
      .populate('interviewId')
      .lean();

    if (!report) {
      throw new AppError('Report not found or unauthorized.', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}
