/**
 * questionNode.js
 * LangGraph Node: Generates the next question using LangChain + Gemini and retrieved RAG context.
 */

import { generateQuestion } from '../../ai/chains/questionChain.js';

export async function questionNode(state) {
  const {
    targetRole,
    experience,
    interviewType,
    difficulty,
    currentQuestionIndex,
    totalQuestions,
    resumeContext,
    technicalContext,
    questions,
    currentEvaluation,
    currentScores,
  } = state;

  const questionNumber = (currentQuestionIndex || 0) + 1;
  const previousQuestionsText = (questions || []).map(q => q.questionText || q.question);

  const generated = await generateQuestion({
    targetRole,
    experience,
    interviewType,
    difficulty,
    questionNumber,
    totalQuestions,
    resumeContext,
    technicalKnowledgeContext: technicalContext,
    previousQuestions: previousQuestionsText,
    previousEvaluation: currentScores ? {
      score: currentScores.overall,
      missingConcepts: currentEvaluation?.missingConcepts || [],
    } : null,
  });

  const questionObj = {
    order: questionNumber,
    questionText: generated.question,
    category: generated.category || interviewType,
    topic: generated.topic || targetRole,
    difficulty: generated.difficulty || difficulty,
    expectedConcepts: generated.expectedConcepts || [],
    source: resumeContext ? 'resume_rag' : 'knowledge_rag',
  };

  const updatedQuestions = [...(questions || []), questionObj];

  return {
    currentQuestion: questionObj,
    questions: updatedQuestions,
    currentQuestionIndex: questionNumber,
  };
}
