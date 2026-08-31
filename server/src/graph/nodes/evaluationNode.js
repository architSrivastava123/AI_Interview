/**
 * evaluationNode.js
 * LangGraph Node: Evaluates candidate answer, executes speech engine analysis,
 * and runs deterministic scoring across 5 dimensions.
 */

import { evaluateAnswer } from '../../ai/chains/evaluationChain.js';
import { analyzeSpeech } from '../../engines/speechEngine.js';
import {
  calculateTechnicalScore,
  calculateFluencyScore,
  calculatePaceScore,
  calculateConfidenceScore,
  calculateCommunicationScore,
  computeOverallScore,
} from '../../engines/scoringEngine.js';

export async function evaluationNode(state) {
  const {
    currentQuestion,
    currentAnswerText,
    currentDurationSeconds,
    targetRole,
    technicalContext,
    evaluations,
    sessionScores,
  } = state;

  // 1. Deterministic speech metrics
  const speechMetrics = analyzeSpeech(currentAnswerText, currentDurationSeconds);

  // 2. Semantic evaluation via Gemini
  const evalResult = await evaluateAnswer({
    questionText: currentQuestion?.questionText || '',
    expectedConcepts: currentQuestion?.expectedConcepts || [],
    answerText: currentAnswerText,
    targetRole,
    difficulty: currentQuestion?.difficulty || 'Medium',
    technicalKnowledgeContext: technicalContext,
  });

  // 3. Deterministic dimension scoring
  const avgRating = (evalResult.correctness + evalResult.technicalDepth + evalResult.relevance) / 3;
  const technicalScore = calculateTechnicalScore(avgRating);
  const fluencyScore = calculateFluencyScore(speechMetrics.fillerCount, speechMetrics.wordCount);
  const paceScore = calculatePaceScore(speechMetrics.wpm);
  const confidenceScore = calculateConfidenceScore(fluencyScore, paceScore, technicalScore);
  const communicationScore = calculateCommunicationScore(fluencyScore, paceScore, avgRating);

  const overallScore = computeOverallScore({
    technical: technicalScore,
    fluency: fluencyScore,
    pace: paceScore,
    confidence: confidenceScore,
    communication: communicationScore,
  });

  const scores = {
    technical: technicalScore,
    fluency: fluencyScore,
    pace: paceScore,
    confidence: confidenceScore,
    communication: communicationScore,
    overall: overallScore,
  };

  const updatedEvaluations = [...(evaluations || []), evalResult];
  const updatedScores = [...(sessionScores || []), scores];

  return {
    currentSpeechMetrics: speechMetrics,
    currentEvaluation: evalResult,
    currentScores: scores,
    evaluations: updatedEvaluations,
    sessionScores: updatedScores,
  };
}
