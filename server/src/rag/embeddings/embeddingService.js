/**
 * embeddingService.js
 * Generates vector embeddings for text chunks using Google Gemini embedding models
 * with an in-memory cache to avoid redundant API calls.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';

const embeddingCache = new Map();

let genAI = null;
if (env.GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
}

/**
 * Deterministic fallback embedding generator for testing / offline mode.
 * Creates a normalized 64-dimensional feature vector from text hash and character n-grams.
 * @param {string} text
 * @returns {Array<number>}
 */
function createFallbackEmbedding(text = '', dims = 64) {
  const vec = new Array(dims).fill(0);
  const clean = text.toLowerCase();

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const pos = (code + i * 31) % dims;
    vec[pos] += 1;
  }

  // Calculate L2 norm
  let norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) norm = 1;

  return vec.map(v => Number((v / norm).toFixed(6)));
}

/**
 * Generates embedding vector for a given text.
 * @param {string} text
 * @returns {Promise<Array<number>>}
 */
export async function getEmbedding(text) {
  if (!text || typeof text !== 'string') return createFallbackEmbedding('');

  const trimmed = text.trim();
  const cacheKey = trimmed.slice(0, 150) + `_${trimmed.length}`;

  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(trimmed);
      if (result?.embedding?.values) {
        const values = result.embedding.values;
        embeddingCache.set(cacheKey, values);
        return values;
      }
    } catch {
      // Graceful fallback to deterministic vector
    }
  }

  const fallback = createFallbackEmbedding(trimmed);
  embeddingCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Batch generates embeddings for multiple chunks in parallel.
 * @param {Array<string>} chunks
 * @returns {Promise<Array<Array<number>>>}
 */
export async function batchGetEmbeddings(chunks = []) {
  return Promise.all(chunks.map(chunk => getEmbedding(chunk)));
}
