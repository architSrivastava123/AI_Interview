/**
 * geminiClient.js
 * Initializes and exports Gemini Chat Model and fallback handlers.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';

let genAI = null;
if (env.GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
}

/**
 * Invokes Gemini model with system and user prompts, expecting JSON response.
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @param {number} [temperature=0.4]
 * @returns {Promise<string>} Raw text output
 */
export async function invokeGeminiJson(prompt, systemInstruction = '', temperature = 0.4) {
  if (!genAI) {
    throw new Error('GOOGLE_API_KEY is not configured on server.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction || undefined,
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
    },
  });

  const response = await model.generateContent(prompt);
  return response.response.text();
}
