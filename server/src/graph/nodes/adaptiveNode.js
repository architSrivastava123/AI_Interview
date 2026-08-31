/**
 * adaptiveNode.js
 * LangGraph Node: Deterministic adaptive difficulty transition & completion check.
 */

import { DIFFICULTY_LEVELS } from '../../config/constants.js';

export function adaptiveNode(state) {
  const { currentScores, difficulty, currentQuestionIndex, totalQuestions } = state;
  const score = currentScores?.overall || 70;

  let currentIndex = DIFFICULTY_LEVELS.indexOf(difficulty);
  if (currentIndex === -1) currentIndex = 1; // Default Medium

  let nextDifficulty = difficulty;

  if (score >= 85) {
    // High performance -> Increase difficulty
    if (currentIndex < DIFFICULTY_LEVELS.length - 1) {
      nextDifficulty = DIFFICULTY_LEVELS[currentIndex + 1];
    }
  } else if (score < 65) {
    // Low performance -> Decrease difficulty or ask foundational follow-up
    if (currentIndex > 0) {
      nextDifficulty = DIFFICULTY_LEVELS[currentIndex - 1];
    }
  }

  const isComplete = (currentQuestionIndex || 0) >= (totalQuestions || 5);

  return {
    difficulty: nextDifficulty,
    isComplete,
  };
}
