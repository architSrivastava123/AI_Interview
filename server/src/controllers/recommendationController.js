/**
 * recommendationController.js
 * Express controller for practice recommendations.
 */

import { Recommendation } from '../models/Recommendation.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * GET /api/recommendations
 * Lists personalized practice recommendations for the user.
 */
export async function listRecommendations(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const recommendations = await Recommendation.find({ clerkUserId })
      .sort({ isCompleted: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/recommendations/:id/toggle
 * Marks a recommendation as completed or pending.
 */
export async function toggleRecommendation(req, res, next) {
  try {
    const clerkUserId = req.auth.userId;
    const rec = await Recommendation.findOne({ _id: req.params.id, clerkUserId });

    if (!rec) {
      throw new AppError('Recommendation not found.', 404, 'NOT_FOUND');
    }

    rec.isCompleted = !rec.isCompleted;
    await rec.save();

    res.status(200).json({
      success: true,
      data: rec,
    });
  } catch (error) {
    next(error);
  }
}
