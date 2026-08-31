/**
 * evaluationPrompts.js
 * Prompt templates for evaluating candidate answers.
 */

export const EVALUATION_SYSTEM_PROMPT = `You are a Principal Software Engineering Interviewer evaluating a candidate's answer.
Analyze the response objectively across correctness, technical depth, and relevance.
Provide constructive, specific feedback highlighting what was good and what was missing.
Do not assign a composite score; assign 0-10 ratings for correctness, technicalDepth, and relevance.
Deterministic scoring will be computed by the backend engine.
Return ONLY valid JSON matching the schema.`;

export function buildEvaluationPrompt({
  questionText = '',
  expectedConcepts = [],
  answerText = '',
  targetRole = 'Frontend Engineer',
  difficulty = 'Medium',
  technicalKnowledgeContext = '',
}) {
  return `Target Role: ${targetRole}
Difficulty: ${difficulty}
Interview Question: "${questionText}"
Expected Key Concepts: ${expectedConcepts.join(', ') || 'Standard best practices'}

${technicalKnowledgeContext ? `REFERENCE TECHNICAL CONTEXT (RAG):\n${technicalKnowledgeContext}\n` : ''}

Candidate's Submitted Answer:
"${answerText || '(Candidate provided an empty response)'}"

Evaluate the candidate's answer. Return ONLY a valid JSON object matching this schema:
{
  "correctness": 8.0,
  "technicalDepth": 7.5,
  "relevance": 9.0,
  "feedback": "Detailed constructive feedback on the response...",
  "strengths": ["Clear definition of concepts", "Accurate real-world example"],
  "weaknesses": ["Did not mention performance trade-offs"],
  "missingConcepts": ["concept name that candidate failed to explain"]
}`;
}
