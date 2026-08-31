/**
 * reportPrompts.js
 * Prompt templates for generating final interview synthesis and executive summaries.
 */

export const REPORT_SYSTEM_PROMPT = `You are a Senior Engineering Hiring Director synthesizing a candidate's complete technical mock interview performance into an executive report.
Analyze all question evaluations, strengths, weaknesses, and skill gaps to produce an honest, actionable summary.
Return ONLY valid JSON matching the schema.`;

export function buildReportSynthesisPrompt({
  targetRole = 'Frontend Engineer',
  overallScore = 75,
  grade = 'B+',
  questionsAndAnswers = [],
}) {
  return `Target Role: ${targetRole}
Overall Computed Score: ${overallScore}/100 (Grade: ${grade})

SESSION QUESTION-BY-QUESTION BREAKDOWN:
${questionsAndAnswers.map((qa, index) => `
Question ${index + 1}: ${qa.questionText} (${qa.difficulty || 'Medium'})
Topic: ${qa.topic}
Candidate Answer: "${qa.answerText}"
Evaluation: Correctness: ${qa.evaluation?.correctness}/10, Technical Depth: ${qa.evaluation?.technicalDepth}/10
Feedback: ${qa.evaluation?.feedback}
Missing Concepts: ${qa.evaluation?.missingConcepts?.join(', ') || 'None'}
`).join('\n---\n')}

Generate a comprehensive executive report summary. Return ONLY a valid JSON object matching this schema:
{
  "executiveSummary": "A concise paragraph summarizing the candidate's overall readiness, strengths, and primary areas for growth.",
  "strengths": ["Top strength 1", "Top strength 2"],
  "weaknesses": ["Primary area to improve 1", "Primary area to improve 2"],
  "recommendedTopics": ["Specific topic 1 to practice", "Specific topic 2 to practice"],
  "nextRecommendedDifficulty": "Medium"
}`;
}
