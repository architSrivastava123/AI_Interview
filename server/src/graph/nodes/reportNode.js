/**
 * reportNode.js
 * LangGraph Node: Compiles final performance scores, runs skill-gap analysis,
 * synthesizes executive report, and generates actionable practice recommendations.
 */

import { computeOverallScore, scoreToGrade } from '../../engines/scoringEngine.js';
import { computeSkillGaps } from '../../engines/skillGapEngine.js';
import { generateRecommendations } from '../../engines/recommendationEngine.js';
import { synthesizeReport } from '../../ai/chains/reportChain.js';

export async function reportNode(state) {
  const {
    targetRole,
    questions = [],
    evaluations = [],
    sessionScores = [],
  } = state;

  const count = sessionScores.length || 1;

  const avgDim = (dim) => {
    const sum = sessionScores.reduce((acc, s) => acc + (s[dim] || 0), 0);
    return Math.round(sum / count);
  };

  const technicalScore = avgDim('technical');
  const fluencyScore = avgDim('fluency');
  const paceScore = avgDim('pace');
  const confidenceScore = avgDim('confidence');
  const communicationScore = avgDim('communication');

  const overallScore = computeOverallScore({
    technical: technicalScore,
    fluency: fluencyScore,
    pace: paceScore,
    confidence: confidenceScore,
    communication: communicationScore,
  });

  const grade = scoreToGrade(overallScore);

  // 1. Skill Gaps
  const skillGaps = computeSkillGaps(
    { technical: technicalScore, fluency: fluencyScore, pace: paceScore, confidence: confidenceScore, communication: communicationScore },
    targetRole
  );

  // 2. Missing Concepts
  const allMissingConcepts = evaluations.flatMap(e => e.missingConcepts || []);
  const uniqueMissingConcepts = Array.from(new Set(allMissingConcepts));

  // 3. Question & Answer Pair Summaries
  const qaPairs = questions.map((q, idx) => ({
    questionText: q.questionText,
    topic: q.topic,
    difficulty: q.difficulty,
    answerText: state.currentAnswerText || '',
    evaluation: evaluations[idx] || {},
    score: sessionScores[idx]?.overall || 0,
  }));

  // 4. Executive synthesis via Gemini
  const synthesis = await synthesizeReport({
    targetRole,
    overallScore,
    grade,
    questionsAndAnswers: qaPairs,
  });

  // 5. Actionable Recommendations
  const recommendations = generateRecommendations(skillGaps, targetRole, uniqueMissingConcepts);

  const finalReport = {
    targetRole,
    totalQuestions: questions.length,
    overallScore,
    technicalScore,
    fluencyScore,
    paceScore,
    confidenceScore,
    communicationScore,
    grade,
    executiveSummary: synthesis.executiveSummary,
    strengths: synthesis.strengths,
    weaknesses: synthesis.weaknesses,
    skillGaps,
    recommendedTopics: synthesis.recommendedTopics,
    nextRecommendedDifficulty: synthesis.nextRecommendedDifficulty,
    questionSummaries: qaPairs.map(qa => ({
      questionText: qa.questionText,
      topic: qa.topic,
      difficulty: qa.difficulty,
      score: qa.score,
      feedback: qa.evaluation?.feedback || '',
      missingConcepts: qa.evaluation?.missingConcepts || [],
    })),
  };

  return {
    finalReport,
    recommendations,
    skillGaps,
    isComplete: true,
  };
}
