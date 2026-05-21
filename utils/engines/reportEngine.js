/**
 * reportEngine.js
 *
 * Interview report generation and export for AI Mock Interview.
 * Assembles structured report objects from session + answer + score data,
 * computes executive summaries, and serializes to JSON/CSV export formats.
 * All functions are pure — no DB or network dependencies.
 */

import moment from 'moment';
import { scoreToGrade, getBenchmarkPercentile, calibrateQuestionDifficulty } from './scoringEngine.js';

// ─── Report Builder ───────────────────────────────────────────────────────────

/**
 * Assembles a complete structured report for a single interview session.
 *
 * @param {Object} session - MockInterview or InterviewSession record
 * @param {Array<Object>} answers - UserAnswer records for this session
 * @param {Object} scores - CandidateScore record for this session
 * @returns {Object} Full report object (matches GeneratedReport table shape)
 */
export function buildSessionReport(session, answers, scores) {
  if (!session) throw new Error('Session is required to build a report');

  const safeAnswers = Array.isArray(answers) ? answers : [];
  const safeScores = scores || {
    technicalScore: 0, fluencyScore: 0, paceScore: 0,
    confidenceScore: 0, communicationScore: 0, compositeScore: 0,
  };

  const questionDetails = safeAnswers.map((answer, idx) => {
    const parts = (answer.userAns || '').split('|||');
    const text = parts[0] || '';
    let duration = 0;
    if (parts[1] && parts[1].startsWith('duration:')) {
      duration = parseInt(parts[1].replace('duration:', ''), 10) || 0;
    }
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wpm = duration > 0 ? Math.round((words / duration) * 60) : 0;
    const rating = parseFloat(answer.rating) || 0;
    const difficulty = calibrateQuestionDifficulty(answer.question || '', session.interviewTrack || '');

    return {
      questionNumber: idx + 1,
      question: answer.question || '',
      userAnswer: text,
      correctAnswer: answer.correctAns || '',
      aiFeedback: answer.feedback || '',
      rating,
      difficulty,
      wordCount: words,
      durationSeconds: duration,
      wpm,
      ratingLabel: rating >= 8 ? 'Excellent' : rating >= 6 ? 'Good' : rating >= 4 ? 'Average' : 'Needs Work',
    };
  });

  const totalScore = Number(safeScores.compositeScore) || 0;
  const grade = scoreToGrade(totalScore);
  const percentile = getBenchmarkPercentile(totalScore, session.interviewTrack || 'General');

  const strengths = identifyStrengths(safeScores);
  const weaknesses = identifyWeaknesses(safeScores);
  const nextSteps = buildNextSteps(weaknesses, session.interviewTrack || 'General');
  const executiveSummary = computeReportSummary({ session, scores: safeScores, grade, percentile });
  const radarData = buildSkillRadarData(safeScores);

  const descParts = (session.jobDesc || '').split('|||');
  const techStack = descParts[0] || session.jobDesc || '';

  const reportData = {
    sessionId: session.mockId || session.mockIdRef || '',
    generatedAt: moment().format('DD-MM-YYYY HH:mm:ss'),
    candidate: {
      email: session.createdBy || '',
      jobPosition: session.jobPosition || '',
      jobTrack: session.interviewTrack || 'General',
      techStack,
      experience: session.jobExperience || '0',
    },
    scores: {
      composite: totalScore,
      technical: safeScores.technicalScore || 0,
      fluency: safeScores.fluencyScore || 0,
      pace: safeScores.paceScore || 0,
      confidence: safeScores.confidenceScore || 0,
      communication: safeScores.communicationScore || 0,
    },
    grade,
    percentile,
    questionDetails,
    strengths,
    weaknesses,
    nextSteps,
    radarData,
    executiveSummary,
  };

  return {
    mockIdRef: session.mockId || session.mockIdRef || '',
    userEmail: session.createdBy || '',
    reportTitle: `Interview Report — ${session.jobPosition || 'Mock Interview'} (${moment().format('MMM D, YYYY')})`,
    executiveSummary,
    reportData: JSON.stringify(reportData),
    totalScore,
    grade,
    strengths: JSON.stringify(strengths),
    weaknesses: JSON.stringify(weaknesses),
    nextSteps: JSON.stringify(nextSteps),
    createdAt: moment().format('DD-MM-YYYY'),
  };
}

/**
 * Builds a multi-session progress report for a candidate.
 *
 * @param {Array<Object>} sessions - InterviewSession records
 * @param {Object} analytics - Output of generateAnalyticsSnapshot()
 * @returns {Object} Progress report object
 */
export function buildProgressReport(sessions, analytics) {
  if (!Array.isArray(sessions)) sessions = [];
  if (!analytics) analytics = {};

  const sortedSessions = [...sessions].sort((a, b) => {
    const da = moment(a.completedAt || a.createdAt, ['DD-MM-YYYY', 'YYYY-MM-DD']).valueOf();
    const db = moment(b.completedAt || b.createdAt, ['DD-MM-YYYY', 'YYYY-MM-DD']).valueOf();
    return da - db;
  });

  const bestSession = sessions.reduce((best, s) =>
    (Number(s.compositeScore) || 0) > (Number(best?.compositeScore) || 0) ? s : best, sessions[0] || null);

  const worstSession = sessions.reduce((worst, s) =>
    (Number(s.compositeScore) || 100) < (Number(worst?.compositeScore) || 100) ? s : worst, sessions[0] || null);

  const firstScore = Number(sortedSessions[0]?.compositeScore) || 0;
  const lastScore = Number(sortedSessions[sortedSessions.length - 1]?.compositeScore) || 0;
  const overallImprovement = Math.round(lastScore - firstScore);

  return {
    generatedAt: moment().format('DD-MM-YYYY HH:mm:ss'),
    totalSessions: sessions.length,
    overallImprovement,
    avgScore: analytics.avgCompositeScore || 0,
    bestSession: bestSession ? {
      mockId: bestSession.mockIdRef || bestSession.mockId,
      score: Number(bestSession.compositeScore) || 0,
      grade: bestSession.grade || 'N/A',
      track: bestSession.jobTrack || 'General',
    } : null,
    worstSession: worstSession ? {
      mockId: worstSession.mockIdRef || worstSession.mockId,
      score: Number(worstSession.compositeScore) || 0,
      grade: worstSession.grade || 'N/A',
      track: worstSession.jobTrack || 'General',
    } : null,
    trend: analytics.trendData ? JSON.parse(analytics.trendData) : [],
    domainBreakdown: analytics.domainBreakdown ? JSON.parse(analytics.domainBreakdown) : [],
    streak: {
      current: analytics.currentStreak || 0,
      longest: analytics.longestStreak || 0,
    },
    velocity: analytics.improvementVelocity || 0,
  };
}

/**
 * Serializes report data to the requested export format.
 *
 * @param {Object} report - Report object (from buildSessionReport or buildProgressReport)
 * @param {'json'|'csv'} format
 * @returns {string} Serialized export string
 */
export function generateExportData(report, format = 'json') {
  if (!report) throw new Error('Report data is required for export');

  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }

  if (format === 'csv') {
    // Parse inner reportData if it's a serialized string
    let data = report;
    if (typeof report.reportData === 'string') {
      try { data = JSON.parse(report.reportData); } catch { data = report; }
    }

    const rows = [];

    // Header row
    rows.push([
      'Question #', 'Question', 'Difficulty', 'Rating', 'Rating Label',
      'User Answer (truncated)', 'WPM', 'Duration (s)', 'AI Feedback (truncated)',
    ].join(','));

    const questions = data.questionDetails || [];
    for (const q of questions) {
      rows.push([
        q.questionNumber || '',
        `"${(q.question || '').replace(/"/g, '""')}"`,
        q.difficulty || '',
        q.rating || '',
        q.ratingLabel || '',
        `"${(q.userAnswer || '').slice(0, 100).replace(/"/g, '""')}"`,
        q.wpm || 0,
        q.durationSeconds || 0,
        `"${(q.aiFeedback || '').slice(0, 100).replace(/"/g, '""')}"`,
      ].join(','));
    }

    return rows.join('\n');
  }

  throw new Error(`Unsupported export format: ${format}. Use 'json' or 'csv'.`);
}

// ─── Summary & Analysis Helpers ───────────────────────────────────────────────

/**
 * Generates an executive summary paragraph for a session report.
 *
 * @param {{ session: Object, scores: Object, grade: string, percentile: number }} context
 * @returns {string} Summary text
 */
export function computeReportSummary({ session, scores, grade, percentile }) {
  const position = session?.jobPosition || 'the target role';
  const track = session?.interviewTrack || 'General';
  const composite = Math.round(Number(scores?.compositeScore) || 0);
  const tech = Math.round(Number(scores?.technicalScore) || 0);
  const fluency = Math.round(Number(scores?.fluencyScore) || 0);

  let performance = 'performed well';
  if (composite >= 85) performance = 'demonstrated exceptional mastery';
  else if (composite >= 70) performance = 'performed solidly';
  else if (composite >= 55) performance = 'showed moderate proficiency';
  else performance = 'identified significant areas for improvement';

  let strengthHighlight = '';
  if (tech >= 80) strengthHighlight = 'Technical depth was a standout strength. ';
  else if (fluency >= 85) strengthHighlight = 'Communication clarity was a notable strength. ';

  return `The candidate ${performance} in this ${track} mock interview for the role of ${position}, achieving a composite score of ${composite}/100 (Grade: ${grade}, ${percentile}th percentile). ${strengthHighlight}Detailed dimension scores and AI feedback are included below to guide targeted improvement.`;
}

/**
 * Builds radar chart coordinate data from multi-dimensional scores.
 *
 * @param {Object} scores - CandidateScore shape
 * @returns {Array<{axis: string, value: number, label: string}>}
 */
export function buildSkillRadarData(scores) {
  const dimensions = [
    { key: 'technicalScore', axis: 'Technical', label: 'Technical' },
    { key: 'fluencyScore', axis: 'Fluency', label: 'Fluency' },
    { key: 'paceScore', axis: 'Pace', label: 'Pace' },
    { key: 'confidenceScore', axis: 'Confidence', label: 'Confidence' },
    { key: 'communicationScore', axis: 'Communication', label: 'Communication' },
  ];

  return dimensions.map(({ key, axis, label }) => ({
    axis,
    label,
    value: Math.round(Number(scores?.[key]) || 0),
  }));
}

// ─── Private Helpers ─────────────────────────────────────────────────────────

function identifyStrengths(scores) {
  const strengths = [];
  if (Number(scores?.technicalScore) >= 75) strengths.push('Strong technical knowledge demonstrated');
  if (Number(scores?.fluencyScore) >= 80) strengths.push('Excellent speech clarity and fluency');
  if (Number(scores?.paceScore) >= 85) strengths.push('Ideal speaking pace maintained throughout');
  if (Number(scores?.confidenceScore) >= 75) strengths.push('High confidence and composure shown');
  if (Number(scores?.communicationScore) >= 75) strengths.push('Clear and structured communication');
  if (strengths.length === 0) strengths.push('Completed the full interview session');
  return strengths;
}

function identifyWeaknesses(scores) {
  const weaknesses = [];
  if (Number(scores?.technicalScore) < 55) weaknesses.push('Technical depth needs improvement');
  if (Number(scores?.fluencyScore) < 60) weaknesses.push('Speech fluency affected by filler words');
  if (Number(scores?.paceScore) < 60) weaknesses.push('Speaking pace outside optimal range (110–150 WPM)');
  if (Number(scores?.confidenceScore) < 55) weaknesses.push('Confidence and delivery can be strengthened');
  if (Number(scores?.communicationScore) < 55) weaknesses.push('Answer structure and clarity needs work');
  return weaknesses;
}

function buildNextSteps(weaknesses, track) {
  const steps = [];
  if (weaknesses.some(w => w.includes('technical'))) {
    steps.push(`Review core ${track} technical concepts and practice LeetCode problems`);
  }
  if (weaknesses.some(w => w.includes('fluency') || w.includes('filler'))) {
    steps.push('Practice speaking without filler words: record yourself and review');
  }
  if (weaknesses.some(w => w.includes('pace'))) {
    steps.push('Practice reading technical content aloud, targeting 110–150 WPM');
  }
  if (weaknesses.some(w => w.includes('confidence'))) {
    steps.push('Use the STAR method for behavioral questions to improve structured delivery');
  }
  steps.push('Schedule your next mock interview session within 48 hours to maintain momentum');
  return steps;
}
