/**
 * interviewPrompts.js
 * Prompt templates for generating questions, follow-ups, and adaptive challenges.
 */

export const QUESTION_GENERATION_SYSTEM_PROMPT = `You are a Senior Principal Technical Interviewer conducting a realistic, structured mock interview.
Your goal is to evaluate candidate competence, problem-solving, and communication.
Always return output strictly matching the requested JSON schema.
Do NOT invent fake facts about the candidate's resume.
If resume context is provided, tailor the question to the candidate's actual stated projects and technologies.
Ensure the question difficulty aligns with the requested difficulty level.`;

/**
 * Builds prompt for generating a question.
 */
export function buildQuestionPrompt({
  targetRole = 'Frontend Engineer',
  experience = '2-4 years',
  interviewType = 'technical',
  difficulty = 'Medium',
  questionNumber = 1,
  totalQuestions = 5,
  resumeContext = '',
  technicalKnowledgeContext = '',
  previousQuestions = [],
  previousEvaluation = null,
}) {
  return `Target Role: ${targetRole}
Experience Level: ${experience}
Interview Track: ${interviewType}
Current Difficulty Level: ${difficulty}
Question Progress: Question ${questionNumber} of ${totalQuestions}

${resumeContext ? `CANDIDATE RESUME CONTEXT:\n${resumeContext}\n` : ''}
${technicalKnowledgeContext ? `RETRIEVED TECHNICAL KNOWLEDGE (RAG):\n${technicalKnowledgeContext}\n` : ''}
${previousQuestions.length > 0 ? `PREVIOUS QUESTIONS ASKED IN THIS SESSION (DO NOT REPEAT):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n` : ''}
${previousEvaluation ? `PREVIOUS ANSWER PERFORMANCE: Score was ${previousEvaluation.score}/100. Missing concepts were: ${previousEvaluation.missingConcepts?.join(', ') || 'None'}.\n` : ''}

Generate a clear, highly realistic ${difficulty} interview question for this candidate.
Respond ONLY with a valid JSON object matching this schema:
{
  "question": "The interview question text",
  "category": "${interviewType}",
  "topic": "Specific topic name (e.g. React Hooks, MongoDB Indexing, System Design)",
  "difficulty": "${difficulty}",
  "expectedConcepts": ["concept1", "concept2", "concept3"]
}`;
}
