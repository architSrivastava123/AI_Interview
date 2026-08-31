/**
 * pdfLoader.js
 * Parses PDF resumes into clean text and structured chunk objects.
 */

import pdf from 'pdf-parse';
import { splitTextIntoChunks } from './markdownLoader.js';

const SKILL_KEYWORDS = [
  'React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js', 'Express',
  'MongoDB', 'PostgreSQL', 'SQL', 'Python', 'Java', 'C++', 'AWS', 'Docker',
  'Kubernetes', 'GraphQL', 'REST', 'Redux', 'Tailwind', 'Git', 'CI/CD',
  'Jest', 'System Design', 'Microservices', 'FastAPI', 'Django', 'Flask'
];

/**
 * Extracts raw text from a PDF Buffer.
 * @param {Buffer} dataBuffer
 * @returns {Promise<string>}
 */
export async function parsePdfBuffer(dataBuffer) {
  try {
    const data = await pdf(dataBuffer);
    return data.text ? data.text.replace(/\r\n/g, '\n').trim() : '';
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Scans resume text for known technical skills.
 * @param {string} text
 * @returns {Array<string>} List of detected unique skills
 */
export function extractSkillsFromText(text = '') {
  const found = new Set();
  const lower = text.toLowerCase();

  for (const skill of SKILL_KEYWORDS) {
    const regex = new RegExp(`\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

/**
 * Processes a resume text into structured chunk items ready for embedding.
 * @param {string} rawText
 * @returns {Array<{ text: string, chunkIndex: number, section: string }>}
 */
export function processResumeIntoChunks(rawText) {
  const chunks = splitTextIntoChunks(rawText, 500, 100);
  return chunks.map((chunk, index) => ({
    text: chunk,
    chunkIndex: index,
    section: index === 0 ? 'header_summary' : 'experience_skills',
  }));
}
