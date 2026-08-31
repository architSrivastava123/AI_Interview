/**
 * state.js
 * LangGraph State Definition for the stateful interview workflow.
 */

import { Annotation } from '@langchain/langgraph';

export const InterviewState = Annotation.Root({
  interviewId: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  clerkUserId: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  targetRole: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 'Frontend Engineer',
  }),
  experience: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '2-4 years',
  }),
  interviewType: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 'technical',
  }),
  difficulty: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 'Medium',
  }),
  totalQuestions: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 5,
  }),
  currentQuestionIndex: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  resumeId: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  resumeContext: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  technicalContext: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  questions: Annotation({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => [],
  }),
  currentQuestion: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  currentAnswerText: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  currentDurationSeconds: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  currentSpeechMetrics: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  currentEvaluation: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  evaluations: Annotation({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => [],
  }),
  currentScores: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  sessionScores: Annotation({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => [],
  }),
  skillGaps: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  isComplete: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
  finalReport: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  recommendations: Annotation({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => [],
  }),
});
