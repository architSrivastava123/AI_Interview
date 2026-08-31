/**
 * knowledgeRetriever.js
 * High-level retriever for technical knowledge base context.
 */

import { searchKnowledgeBase } from '../vectorStore/mongoVectorStore.js';

/**
 * Retrieves relevant technical knowledge context for question generation or evaluation.
 * @param {string} topicOrQuery
 * @param {string} [role]
 * @param {number} [topK=2]
 * @returns {Promise<{ contextText: string, sources: Array<string> }>}
 */
export async function retrieveTechnicalKnowledge(topicOrQuery, role = 'general', topK = 2) {
  try {
    const results = await searchKnowledgeBase(topicOrQuery, {}, topK);

    if (!results || results.length === 0) {
      return {
        contextText: 'Standard technical interview guidelines apply.',
        sources: [],
      };
    }

    const contextSnippets = results.map(r => `[${r.document.title} - ${r.document.topic}]\n${r.document.content}`);
    const sources = results.map(r => r.document.source);

    return {
      contextText: contextSnippets.join('\n\n---\n\n'),
      sources,
    };
  } catch (error) {
    console.warn('[RAG] retrieveTechnicalKnowledge error:', error.message);
    return {
      contextText: 'Standard technical interview guidelines apply.',
      sources: [],
    };
  }
}
