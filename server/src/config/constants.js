/**
 * constants.js
 * Application constants, weights, thresholds, and benchmark configs.
 */

export const SCORE_WEIGHTS = {
  technical: 0.40,
  fluency: 0.20,
  pace: 0.15,
  confidence: 0.15,
  communication: 0.10,
};

export const IDEAL_WPM_MIN = 110;
export const IDEAL_WPM_MAX = 150;

export const FILLER_WORDS = [
  'um', 'uh', 'ah', 'like', 'basically', 'actually', 'you know',
  'literally', 'kind of', 'sort of', 'i mean', 'right'
];

export const GRADE_THRESHOLDS = [
  { min: 95, grade: 'A+' },
  { min: 88, grade: 'A' },
  { min: 82, grade: 'A-' },
  { min: 76, grade: 'B+' },
  { min: 70, grade: 'B' },
  { min: 64, grade: 'B-' },
  { min: 58, grade: 'C+' },
  { min: 52, grade: 'C' },
  { min: 46, grade: 'C-' },
  { min: 40, grade: 'D' },
  { min: 0,  grade: 'F' },
];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard', 'Expert'];

export const ROLE_TARGETS = {
  Frontend:       { technical: 75, fluency: 70, pace: 70, confidence: 72, communication: 73 },
  Backend:        { technical: 80, fluency: 65, pace: 65, confidence: 70, communication: 68 },
  'Full Stack':   { technical: 78, fluency: 68, pace: 68, confidence: 71, communication: 70 },
  'Data Science': { technical: 82, fluency: 70, pace: 65, confidence: 73, communication: 72 },
  'Machine Learning': { technical: 85, fluency: 68, pace: 65, confidence: 72, communication: 70 },
  'Product Manager': { technical: 68, fluency: 80, pace: 78, confidence: 82, communication: 83 },
  DevOps:         { technical: 78, fluency: 65, pace: 65, confidence: 68, communication: 67 },
  Cybersecurity:  { technical: 83, fluency: 70, pace: 68, communication: 70, confidence: 72 },
  General:        { technical: 70, fluency: 70, pace: 70, confidence: 70, communication: 70 },
};
