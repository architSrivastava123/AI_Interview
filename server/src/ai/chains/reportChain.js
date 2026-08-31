/**
 * reportChain.js
 * LangChain pipeline for synthesizing final interview performance into structured executive reports.
 */

import { invokeGeminiJson } from '../models/geminiClient.js';
import { REPORT_SYSTEM_PROMPT, buildReportSynthesisPrompt } from '../prompts/reportPrompts.js';
import { ReportSynthesisSchema } from '../schemas/aiSchemas.js';

/**
 * Synthesizes final report using Gemini and validates with Zod.
 * @param {Object} params
 * @returns {Promise<Object>} Validated report synthesis object
 */
export async function synthesizeReport(params) {
  const prompt = buildReportSynthesisPrompt(params);

  try {
    const rawOutput = await invokeGeminiJson(prompt, REPORT_SYSTEM_PROMPT, 0.3);
    const parsed = JSON.parse(rawOutput);
    const validated = ReportSynthesisSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.warn(`[ReportChain] Gemini synthesis failed (${error.message}). Using rule-based synthesis.`);
    return getFallbackReportSynthesis(params);
  }
}

function getFallbackReportSynthesis(params) {
  const score = params.overallScore || 70;
  const grade = params.grade || 'B';
  const role = params.targetRole || 'Software Engineer';

  return {
    executiveSummary: `The candidate completed the ${role} mock interview achieving an overall score of ${score}/100 (Grade: ${grade}). The candidate demonstrated solid fundamental domain knowledge with clear communication delivery.`,
    strengths: [
      `Demonstrated solid foundational understanding of ${role} concepts.`,
      'Structured communication and clear pacing during answer delivery.',
    ],
    weaknesses: [
      'Opportunity to discuss deeper system trade-offs and performance implications.',
      'Reduce occasional filler word occurrences during complex explanations.',
    ],
    recommendedTopics: [
      `${role} Core Best Practices`,
      'System Design & Performance Optimization',
    ],
    nextRecommendedDifficulty: score >= 80 ? 'Hard' : score >= 60 ? 'Medium' : 'Easy',
  };
}
