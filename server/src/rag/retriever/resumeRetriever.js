/**
 * resumeRetriever.js
 * Retrieves candidate resume chunks matching specific topics or target roles.
 */

import { Resume } from '../../models/Resume.js';
import { getEmbedding } from '../embeddings/embeddingService.js';
import { searchSimilarVectors } from '../vectorStore/vectorStore.js';

/**
 * Retrieves relevant resume chunks for a given candidate and interview focus.
 * @param {string} resumeId - Resume ObjectId
 * @param {string} clerkUserId - Authenticated Clerk user ID
 * @param {string} queryTopic - Target role or focus topic
 * @param {number} [topK=2]
 * @returns {Promise<{ resumeContextText: string, parsedSkills: Array<string> }>}
 */
export async function retrieveResumeContext(resumeId, clerkUserId, queryTopic = '', topK = 2) {
  if (!resumeId || !clerkUserId) {
    return { resumeContextText: '', parsedSkills: [] };
  }

  try {
    const resume = await Resume.findOne({ _id: resumeId, clerkUserId }).lean();
    if (!resume || !resume.chunks || resume.chunks.length === 0) {
      return {
        resumeContextText: resume ? resume.rawText.slice(0, 1000) : '',
        parsedSkills: resume?.parsedSkills || [],
      };
    }

    if (!queryTopic) {
      // Return top chunks
      const topChunks = resume.chunks.slice(0, topK).map(c => c.text).join('\n\n');
      return {
        resumeContextText: topChunks,
        parsedSkills: resume.parsedSkills || [],
      };
    }

    const queryEmbedding = await getEmbedding(queryTopic);
    const results = searchSimilarVectors(queryEmbedding, resume.chunks, topK);

    const relevantText = results.length > 0
      ? results.map(r => r.document.text).join('\n\n')
      : resume.chunks.slice(0, topK).map(c => c.text).join('\n\n');

    return {
      resumeContextText: relevantText,
      parsedSkills: resume.parsedSkills || [],
    };
  } catch (error) {
    console.warn('[RAG] retrieveResumeContext error:', error.message);
    return { resumeContextText: '', parsedSkills: [] };
  }
}
