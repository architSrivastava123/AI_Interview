/**
 * scoringEngine.js
 *
 * Core scoring business logic for AI Mock Interview.
 * Computes multi-dimensional candidate scores from raw session data.
 * All functions are pure — no DB or network dependencies — making them fully unit-testable.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Ideal speaking pace range in words per minute */
export const IDEAL_WPM_MIN = 110;
export const IDEAL_WPM_MAX = 150;

/** Dimension weights for composite score calculation (must sum to 1.0) */
export const SCORE_WEIGHTS = {
  technical: 0.40,
  fluency: 0.20,
  pace: 0.15,
  confidence: 0.15,
  communication: 0.10,
};

/** Grade thresholds (composite score 0–100) */
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

/** Domain-specific benchmark distributions (mean composite score, stddev) */
export const DOMAIN_BENCHMARKS = {
  Frontend:       { mean: 68, stddev: 12 },
  Backend:        { mean: 65, stddev: 14 },
  'Full Stack':   { mean: 62, stddev: 13 },
  'Data Science': { mean: 70, stddev: 11 },
  'Machine Learning': { mean: 72, stddev: 10 },
  'Product Manager': { mean: 66, stddev: 12 },
  DevOps:         { mean: 63, stddev: 13 },
  Cybersecurity:  { mean: 69, stddev: 11 },
  General:        { mean: 65, stddev: 13 },
};

/** Question difficulty classification keywords */
export const DIFFICULTY_MARKERS = {
  Expert: [
    'distributed systems', 'consensus', 'raft', 'paxos', 'cap theorem',
    'byzantine', 'lock-free', 'concurrent', 'kernel', 'compiler',
    'neural network architecture', 'transformer', 'BERT', 'GAN',
  ],
  Hard: [
    'design system', 'microservices', 'event sourcing', 'cqrs',
    'database sharding', 'horizontal scaling', 'load balancer',
    'cache invalidation', 'race condition', 'deadlock', 'trade-off',
    'architecture', 'optimization', 'complexity',
  ],
  Medium: [
    'REST API', 'database', 'sql', 'react hooks', 'state management',
    'testing', 'authentication', 'jwt', 'docker', 'ci/cd',
    'async', 'promise', 'closure', 'prototype',
  ],
};

// ─── Core Scoring Functions ───────────────────────────────────────────────────

/**
 * Converts an AI rating (0–10 scale) to a normalized technical score (0–100).
 * Applies a non-linear curve that rewards high scores more significantly.
 *
 * @param {number} rating - AI-assigned rating (0–10)
 * @returns {number} Technical score (0–100)
 */
export function calculateTechnicalScore(rating) {
  const r = Math.max(0, Math.min(10, Number(rating) || 0));
  // Non-linear curve: rewards high ratings more aggressively.
  // r=0 → 0, r=5 → 56, r=7 → 73, r=9 → 90, r=10 → 100
  const score = Math.pow(r / 10, 0.85) * 100;
  return Math.min(100, Math.round(score));
}

/**
 * Scores speech fluency based on filler word density.
 * More filler words per word spoken = lower fluency score.
 *
 * @param {number} fillerCount - Total filler words detected
 * @param {number} wordCount - Total words spoken
 * @returns {number} Fluency score (0–100)
 */
export function calculateFluencyScore(fillerCount, wordCount) {
  const f = Math.max(0, Number(fillerCount) || 0);
  const w = Math.max(1, Number(wordCount) || 1);

  if (w === 0) return 100;

  const density = f / w;
  // 0 fillers → 100, 5% density → ~70, 15% density → ~40
  const score = Math.max(0, 100 - Math.round(density * 600));
  return Math.min(100, score);
}

/**
 * Scores speaking pace based on words per minute.
 * Ideal range is 110–150 WPM. Penalties applied outside this range.
 *
 * @param {number} wpm - Words per minute (0 means typed, not spoken)
 * @returns {number} Pace score (0–100)
 */
export function calculatePaceScore(wpm) {
  const w = Math.max(0, Number(wpm) || 0);

  // Typed response — neutral score (not penalized, not rewarded)
  if (w === 0) return 75;

  if (w >= IDEAL_WPM_MIN && w <= IDEAL_WPM_MAX) return 100;

  if (w < IDEAL_WPM_MIN) {
    // Below ideal: linear decay from 110 → 0 WPM
    return Math.max(0, Math.round(100 - ((IDEAL_WPM_MIN - w) / IDEAL_WPM_MIN) * 100));
  }

  // Above ideal: steeper decay for very fast speech
  const excess = w - IDEAL_WPM_MAX;
  return Math.max(0, Math.round(100 - excess * 1.2));
}

/**
 * Computes a composite confidence score from fluency, pace, and technical rating.
 * Models interviewer perception of candidate's self-assurance.
 *
 * @param {number} fluencyScore - Fluency score (0–100)
 * @param {number} paceScore - Pace score (0–100)
 * @param {number} technicalScore - Technical score (0–100)
 * @returns {number} Confidence score (0–100)
 */
export function calculateConfidenceScore(fluencyScore, paceScore, technicalScore) {
  const f = Math.max(0, Math.min(100, Number(fluencyScore) || 0));
  const p = Math.max(0, Math.min(100, Number(paceScore) || 0));
  const t = Math.max(0, Math.min(100, Number(technicalScore) || 0));

  // Weighted average: fluency 40%, pace 35%, technical 25%
  return Math.round(f * 0.40 + p * 0.35 + t * 0.25);
}

/**
 * Computes overall communication effectiveness score.
 * Combines clarity (fluency), delivery (pace), and content quality (technical).
 *
 * @param {number} fluencyScore - Fluency score (0–100)
 * @param {number} paceScore - Pace score (0–100)
 * @param {number} rating - Raw AI rating (0–10)
 * @returns {number} Communication score (0–100)
 */
export function calculateCommunicationScore(fluencyScore, paceScore, rating) {
  const f = Math.max(0, Math.min(100, Number(fluencyScore) || 0));
  const p = Math.max(0, Math.min(100, Number(paceScore) || 0));
  const rNorm = calculateTechnicalScore(rating);

  return Math.round(f * 0.35 + p * 0.30 + rNorm * 0.35);
}

/**
 * Aggregates individual answer data into a full session score object.
 * Input: array of answer records from UserAnswer table.
 *
 * @param {Array<{rating: string, userAns: string}>} answers
 * @returns {Object} Full session score shape compatible with CandidateScore table
 */
export function computeSessionScore(answers) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return {
      technicalScore: 0,
      fluencyScore: 0,
      paceScore: 0,
      confidenceScore: 0,
      communicationScore: 0,
      compositeScore: 0,
      grade: 'F',
      percentile: 0,
      rawRatingAvg: 0,
      totalFillerWords: 0,
      avgWpm: 0,
    };
  }

  const FILLER_WORDS = ['um', 'ah', 'uh', 'like', 'basically', 'you know', 'actually', 'literally'];

  let totalRating = 0;
  let validRatingCount = 0;
  let totalFillers = 0;
  let totalWords = 0;
  let totalWpm = 0;
  let wpmCount = 0;

  for (const answer of answers) {
    // Parse rating
    const rating = parseFloat(answer.rating);
    if (!isNaN(rating)) {
      totalRating += rating;
      validRatingCount++;
    }

    // Parse answer text and duration metadata
    const parts = (answer.userAns || '').split('|||');
    const text = parts[0] || '';
    let duration = 0;
    if (parts[1] && parts[1].startsWith('duration:')) {
      duration = parseInt(parts[1].replace('duration:', ''), 10) || 0;
    }

    // Count filler words
    const lowerText = text.toLowerCase();
    let answerFillers = 0;
    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) answerFillers += matches.length;
    });
    totalFillers += answerFillers;

    // Count words
    const cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    const words = cleaned.trim().split(/\s+/).filter(w => w.length > 0).length;
    totalWords += words;

    // WPM
    if (duration > 0 && words > 0) {
      totalWpm += (words / duration) * 60;
      wpmCount++;
    }
  }

  const rawRatingAvg = validRatingCount > 0 ? totalRating / validRatingCount : 0;
  const avgWpm = wpmCount > 0 ? Math.round(totalWpm / wpmCount) : 0;

  const technicalScore = calculateTechnicalScore(rawRatingAvg);
  const fluencyScore = calculateFluencyScore(totalFillers, totalWords);
  const paceScore = calculatePaceScore(avgWpm);
  const confidenceScore = calculateConfidenceScore(fluencyScore, paceScore, technicalScore);
  const communicationScore = calculateCommunicationScore(fluencyScore, paceScore, rawRatingAvg);

  const compositeScore = Math.round(
    technicalScore * SCORE_WEIGHTS.technical +
    fluencyScore * SCORE_WEIGHTS.fluency +
    paceScore * SCORE_WEIGHTS.pace +
    confidenceScore * SCORE_WEIGHTS.confidence +
    communicationScore * SCORE_WEIGHTS.communication
  );

  return {
    technicalScore,
    fluencyScore,
    paceScore,
    confidenceScore,
    communicationScore,
    compositeScore,
    grade: scoreToGrade(compositeScore),
    percentile: 50, // placeholder; use getBenchmarkPercentile for real value
    rawRatingAvg: Math.round(rawRatingAvg * 10) / 10,
    totalFillerWords: totalFillers,
    avgWpm,
  };
}

/**
 * Maps a numeric composite score (0–100) to a letter grade.
 *
 * @param {number} score - Composite score (0–100)
 * @returns {string} Letter grade
 */
export function scoreToGrade(score) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  for (const { min, grade } of GRADE_THRESHOLDS) {
    if (s >= min) return grade;
  }
  return 'F';
}

/**
 * Estimates candidate percentile rank against domain-specific benchmark distribution.
 * Uses a normal distribution approximation.
 *
 * @param {number} score - Composite score (0–100)
 * @param {string} domain - Interview track/domain
 * @returns {number} Percentile (0–100)
 */
export function getBenchmarkPercentile(score, domain) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  const benchmark = DOMAIN_BENCHMARKS[domain] || DOMAIN_BENCHMARKS.General;
  const { mean, stddev } = benchmark;

  // Standard normal CDF approximation (Abramowitz and Stegun)
  const z = (s - mean) / stddev;
  const percentile = normalCDF(z) * 100;
  return Math.round(Math.max(1, Math.min(99, percentile)));
}

/**
 * Classifies a question's difficulty based on keywords in its text.
 *
 * @param {string} questionText - The question string
 * @param {string} track - Interview track for context
 * @returns {'Easy'|'Medium'|'Hard'|'Expert'} Difficulty label
 */
export function calibrateQuestionDifficulty(questionText, track = 'General') {
  const text = (questionText || '').toLowerCase();

  for (const keyword of DIFFICULTY_MARKERS.Expert) {
    if (text.includes(keyword.toLowerCase())) return 'Expert';
  }
  for (const keyword of DIFFICULTY_MARKERS.Hard) {
    if (text.includes(keyword.toLowerCase())) return 'Hard';
  }
  for (const keyword of DIFFICULTY_MARKERS.Medium) {
    if (text.includes(keyword.toLowerCase())) return 'Medium';
  }

  return 'Easy';
}

// ─── Helper: Normal CDF approximation ────────────────────────────────────────

/**
 * Approximates the standard normal CDF using the Horner method approximation.
 * @param {number} z - z-score
 * @returns {number} Probability (0–1)
 */
function normalCDF(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    0.319381530 * t -
    0.356563782 * t * t +
    1.781477937 * t * t * t -
    1.821255978 * t * t * t * t +
    1.330274429 * t * t * t * t * t;
  const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const cdf = 1 - pdf * poly;
  return z >= 0 ? cdf : 1 - cdf;
}
