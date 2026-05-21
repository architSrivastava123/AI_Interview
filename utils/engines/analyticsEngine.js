/**
 * analyticsEngine.js
 *
 * Historical performance analytics for AI Mock Interview.
 * Computes trends, skill gaps, domain breakdowns, streaks, and improvement velocity
 * from arrays of session and score data.
 * All functions are pure — no DB or network dependencies.
 */

import moment from 'moment';

// ─── Performance Trend ────────────────────────────────────────────────────────

/**
 * Builds a time-ordered performance trend from an array of sessions.
 * Returns data suitable for line chart rendering.
 *
 * @param {Array<{completedAt: string, compositeScore: number, grade: string, mockIdRef: string}>} sessions
 * @returns {Array<{date: string, score: number, grade: string, mockId: string}>}
 */
export function buildPerformanceTrend(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) return [];

  return sessions
    .filter(s => s && (s.completedAt || s.createdAt))
    .map(s => ({
      date: s.completedAt || s.createdAt || '',
      score: Math.round(Number(s.compositeScore) || 0),
      grade: s.grade || 'N/A',
      mockId: s.mockIdRef || s.mockId || '',
      track: s.jobTrack || s.interviewTrack || 'General',
      position: s.jobPosition || '',
    }))
    .sort((a, b) => {
      // Sort by date ascending (DD-MM-YYYY format)
      const da = moment(a.date, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']).valueOf();
      const db = moment(b.date, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']).valueOf();
      return da - db;
    });
}

// ─── Skill Gap Analysis ───────────────────────────────────────────────────────

/**
 * Computes a skill gap matrix by comparing candidate dimension averages
 * against role-specific target benchmarks.
 *
 * @param {Array<Object>} scores - Array of CandidateScore records
 * @param {string} targetRole - The job role to benchmark against
 * @returns {Object} Skill gap matrix with dimensions and gaps
 */
export function computeSkillGapMatrix(scores, targetRole = 'General') {
  const ROLE_TARGETS = {
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

  const targets = ROLE_TARGETS[targetRole] || ROLE_TARGETS.General;

  if (!Array.isArray(scores) || scores.length === 0) {
    return {
      dimensions: Object.keys(targets).map(dim => ({
        dimension: dim,
        candidateAvg: 0,
        target: targets[dim],
        gap: -targets[dim],
        status: 'critical',
      })),
      overallGap: -70,
      targetRole,
    };
  }

  const dimensions = ['technical', 'fluency', 'pace', 'confidence', 'communication'];
  const dimensionResults = dimensions.map(dim => {
    const key = `${dim}Score`;
    const values = scores
      .map(s => Number(s[key]) || 0)
      .filter(v => v > 0);
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const target = targets[dim] || 70;
    const gap = Math.round(avg - target);
    const status = gap >= 5 ? 'strong' : gap >= -5 ? 'on-track' : gap >= -15 ? 'needs-work' : 'critical';

    return {
      dimension: dim,
      candidateAvg: Math.round(avg),
      target,
      gap,
      status,
    };
  });

  const overallGap = Math.round(
    dimensionResults.reduce((sum, d) => sum + d.gap, 0) / dimensionResults.length
  );

  return {
    dimensions: dimensionResults,
    overallGap,
    targetRole,
  };
}

// ─── Improvement Velocity ─────────────────────────────────────────────────────

/**
 * Measures how quickly a candidate is improving across sessions.
 * Returns a signed velocity value: positive = improving, negative = declining.
 *
 * @param {Array<{compositeScore: number}>} sessions - Time-ordered (oldest first)
 * @returns {{ velocity: number, trend: 'improving'|'declining'|'stable'|'insufficient_data', changePercent: number }}
 */
export function computeImprovementVelocity(sessions) {
  if (!Array.isArray(sessions) || sessions.length < 2) {
    return { velocity: 0, trend: 'insufficient_data', changePercent: 0 };
  }

  const scores = sessions.map(s => Number(s.compositeScore) || 0);

  // Linear regression slope
  const n = scores.length;
  const xMean = (n - 1) / 2;
  const yMean = scores.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (scores[i] - yMean);
    den += (i - xMean) ** 2;
  }

  const slope = den !== 0 ? num / den : 0;
  const velocity = Math.round(slope * 10) / 10;

  const first = scores[0];
  const last = scores[n - 1];
  const changePercent = first !== 0 ? Math.round(((last - first) / first) * 100) : 0;

  let trend;
  if (Math.abs(velocity) < 0.5) trend = 'stable';
  else if (velocity > 0) trend = 'improving';
  else trend = 'declining';

  return { velocity, trend, changePercent };
}

// ─── Domain Breakdown ─────────────────────────────────────────────────────────

/**
 * Aggregates performance metrics grouped by interview track/domain.
 *
 * @param {Array<Object>} sessions - Session records with jobTrack and compositeScore
 * @returns {Array<{domain: string, count: number, avgScore: number, bestScore: number, lastScore: number}>}
 */
export function getDomainBreakdown(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) return [];

  const domainMap = {};

  for (const session of sessions) {
    const domain = session.jobTrack || session.interviewTrack || 'General';
    const score = Number(session.compositeScore) || 0;

    if (!domainMap[domain]) {
      domainMap[domain] = { domain, scores: [], lastScore: score };
    }
    domainMap[domain].scores.push(score);
    domainMap[domain].lastScore = score; // last seen is most recent in sorted order
  }

  return Object.values(domainMap).map(({ domain, scores, lastScore }) => ({
    domain,
    count: scores.length,
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    bestScore: Math.max(...scores),
    lastScore,
  })).sort((a, b) => b.count - a.count);
}

// ─── Streak Calculation ───────────────────────────────────────────────────────

/**
 * Computes current and longest interview streaks (consecutive days with a session).
 *
 * @param {Array<{completedAt: string}>} sessions - Time-ordered sessions
 * @returns {{ currentStreak: number, longestStreak: number, totalActiveDays: number }}
 */
export function computeStreakData(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
  }

  // Extract unique dates (YYYY-MM-DD)
  const dates = [...new Set(
    sessions
      .map(s => {
        const raw = s.completedAt || s.createdAt || '';
        return moment(raw, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']).format('YYYY-MM-DD');
      })
      .filter(d => d !== 'Invalid date')
  )].sort();

  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };

  let longestStreak = 1;
  let currentRun = 1;
  const today = moment().format('YYYY-MM-DD');

  for (let i = 1; i < dates.length; i++) {
    const prev = moment(dates[i - 1]);
    const curr = moment(dates[i]);
    if (curr.diff(prev, 'days') === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Current streak: count back from today
  let currentStreak = 0;
  let checkDate = moment(today);
  for (let i = dates.length - 1; i >= 0; i--) {
    if (moment(dates[i]).isSame(checkDate, 'day')) {
      currentStreak++;
      checkDate = checkDate.subtract(1, 'day');
    } else if (moment(dates[i]).isBefore(checkDate, 'day')) {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalActiveDays: dates.length,
  };
}

// ─── Analytics Snapshot Builder ───────────────────────────────────────────────

/**
 * Builds an AnalyticsSnapshot record from raw session + score data.
 *
 * @param {string} userEmail
 * @param {Array<Object>} sessions - InterviewSession records with compositeScore
 * @param {Array<Object>} scores - CandidateScore records
 * @returns {Object} AnalyticsSnapshot-shaped record
 */
export function generateAnalyticsSnapshot(userEmail, sessions, scores) {
  const trend = buildPerformanceTrend(sessions);
  const velocity = computeImprovementVelocity(sessions);
  const streaks = computeStreakData(sessions);
  const domains = getDomainBreakdown(sessions);

  const compositesArr = sessions.map(s => Number(s.compositeScore) || 0).filter(v => v > 0);
  const avgComposite = compositesArr.length > 0
    ? Math.round(compositesArr.reduce((a, b) => a + b, 0) / compositesArr.length)
    : 0;

  const avg = (key) => {
    const vals = scores.map(s => Number(s[key]) || 0).filter(v => v > 0);
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };

  return {
    userEmail,
    snapshotDate: moment().format('DD-MM-YYYY'),
    totalSessions: sessions.length,
    avgCompositeScore: avgComposite,
    avgTechnicalScore: avg('technicalScore'),
    avgFluencyScore: avg('fluencyScore'),
    avgPaceScore: avg('paceScore'),
    avgConfidenceScore: avg('confidenceScore'),
    bestScore: compositesArr.length > 0 ? Math.max(...compositesArr) : 0,
    worstScore: compositesArr.length > 0 ? Math.min(...compositesArr) : 0,
    improvementVelocity: velocity.velocity,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    domainBreakdown: JSON.stringify(domains),
    trendData: JSON.stringify(trend),
    createdAt: moment().format('DD-MM-YYYY'),
  };
}

// ─── Session Ranking ──────────────────────────────────────────────────────────

/**
 * Ranks sessions by composite score descending (best first).
 *
 * @param {Array<Object>} sessions
 * @returns {Array<Object>} Sorted sessions
 */
export function rankSessionsByPerformance(sessions) {
  if (!Array.isArray(sessions)) return [];
  return [...sessions].sort((a, b) => (Number(b.compositeScore) || 0) - (Number(a.compositeScore) || 0));
}
