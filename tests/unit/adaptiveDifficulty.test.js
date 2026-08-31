import { adaptiveNode } from '../../server/src/graph/nodes/adaptiveNode.js';

describe('Adaptive Difficulty Transition Node', () => {
  test('increases difficulty when score >= 85', () => {
    const state = {
      difficulty: 'Medium',
      currentScores: { overall: 90 },
      currentQuestionIndex: 2,
      totalQuestions: 5,
    };

    const result = adaptiveNode(state);
    expect(result.difficulty).toBe('Hard');
    expect(result.isComplete).toBe(false);
  });

  test('maintains difficulty for score between 65 and 84', () => {
    const state = {
      difficulty: 'Hard',
      currentScores: { overall: 75 },
      currentQuestionIndex: 2,
      totalQuestions: 5,
    };

    const result = adaptiveNode(state);
    expect(result.difficulty).toBe('Hard');
  });

  test('decreases difficulty when score < 65', () => {
    const state = {
      difficulty: 'Hard',
      currentScores: { overall: 50 },
      currentQuestionIndex: 2,
      totalQuestions: 5,
    };

    const result = adaptiveNode(state);
    expect(result.difficulty).toBe('Medium');
  });

  test('does not exceed Expert level bounds', () => {
    const state = {
      difficulty: 'Expert',
      currentScores: { overall: 95 },
      currentQuestionIndex: 2,
      totalQuestions: 5,
    };

    const result = adaptiveNode(state);
    expect(result.difficulty).toBe('Expert');
  });

  test('detects interview completion when question index equals total questions', () => {
    const state = {
      difficulty: 'Medium',
      currentScores: { overall: 80 },
      currentQuestionIndex: 5,
      totalQuestions: 5,
    };

    const result = adaptiveNode(state);
    expect(result.isComplete).toBe(true);
  });
});
