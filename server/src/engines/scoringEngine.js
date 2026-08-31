/**
 * scoringEngine.js
 * Pure deterministic scoring engine for candidate answer and session scoring.
 * All functions are pure, deterministic, and independently unit-testable.
 */

import { SCORE_WEIGHTS, GRADE_THRESHOLDS, IDEAL_WPM_MIN, IDEAL_WPM_MAX } from '../config/constants.js';

/**
 * Converts raw AI rating (0–10 scale) to normalized technical score (0–100).
 * Uses non-linear curve rewarding high scores.
 * @param {number} rating - AI rating (0-10)
 * @returns {number} Normalized score (0-100)
 */
export function calculateTechnicalScore(rating) {
  const r = Math.max(0, Math.min(10, Number(rating) || 0));
  const score = Math.pow(r / 10, 0.85) * 100;
  return Math.min(100, Math.round(score));
}

/**
 * Calculates speech fluency score based on filler word density.
 * @param {number} fillerCount - Total filler words detected
 * @param {number} wordCount - Total words spoken
 * @returns {number} Fluency score (0-100)
 */
export function calculateFluencyScore(fillerCount, wordCount) {
  const f = Math.max(0, Number(fillerCount) || 0);
  const w = Math.max(1, Number(wordCount) || 1);

  if (w === 0) return 100;

  const density = f / w;
  const score = Math.max(0, 100 - Math.round(density * 600));
  return Math.min(100, score);
}

/**
 * Calculates speaking pace score based on words per minute (WPM).
 * Ideal range is 110–150 WPM.
 * @param {number} wpm - Words per minute
 * @returns {number} Pace score (0-100)
 */
export function calculatePaceScore(wpm) {
  const w = Math.max(0, Number(wpm) || 0);

  // If 0, typed answer -> neutral score 75
  if (w === 0) return 75;

  if (w >= IDEAL_WPM_MIN && w <= IDEAL_WPM_MAX) {
    return 100;
  }

  if (w < IDEAL_WPM_MIN) {
    return Math.max(0, Math.round(100 - ((IDEAL_WPM_MIN - w) / IDEAL_WPM_MIN) * 100));
  }

  const excess = w - IDEAL_WPM_MAX;
  return Math.max(0, Math.round(100 - excess * 1.2));
}

/**
 * Calculates confidence score combining fluency, pace, and technical depth.
 * @param {number} fluencyScore
 * @param {number} paceScore
 * @param {number} technicalScore
 * @returns {number} Confidence score (0-100)
 */
export function calculateConfidenceScore(fluencyScore, paceScore, technicalScore) {
  const f = Math.max(0, Math.min(100, Number(fluencyScore) || 0));
  const p = Math.max(0, Math.min(100, Number(paceScore) || 0));
  const t = Math.max(0, Math.min(100, Number(technicalScore) || 0));

  return Math.round(f * 0.40 + p * 0.35 + t * 0.25);
}

/**
 * Calculates communication score combining delivery and content quality.
 * @param {number} fluencyScore
 * @param {number} paceScore
 * @param {number} rating
 * @returns {number} Communication score (0-100)
 */
export function calculateCommunicationScore(fluencyScore, paceScore, rating) {
  const f = Math.max(0, Math.min(100, Number(fluencyScore) || 0));
  const p = Math.max(0, Math.min(100, Number(paceScore) || 0));
  const t = calculateTechnicalScore(rating);

  return Math.round(f * 0.35 + p * 0.30 + t * 0.35);
}

/**
 * Computes composite overall score from the 5 dimensions.
 * @param {Object} scores - { technical, fluency, pace, confidence, communication }
 * @returns {number} Overall composite score (0-100)
 */
export function computeOverallScore({ technical = 0, fluency = 0, pace = 0, confidence = 0, communication = 0 }) {
  const composite = (
    technical * SCORE_WEIGHTS.technical +
    fluency * SCORE_WEIGHTS.fluency +
    pace * SCORE_WEIGHTS.pace +
    confidence * SCORE_WEIGHTS.confidence +
    communication * SCORE_WEIGHTS.communication
  );
  return Math.min(100, Math.max(0, Math.round(composite)));
}

/**
 * Converts numeric score (0-100) to letter grade.
 * @param {number} score
 * @returns {string} Grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)
 */
export function scoreToGrade(score) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  for (const { min, grade } of GRADE_THRESHOLDS) {
    if (s >= min) return grade;
  }
  return 'F';
}
