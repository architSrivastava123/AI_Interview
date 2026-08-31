/**
 * vectorStore.js
 * Vector similarity utilities and in-memory similarity search abstraction.
 */

/**
 * Calculates cosine similarity between two numeric vectors.
 * @param {Array<number>} vecA
 * @param {Array<number>} vecB
 * @returns {number} Cosine similarity between -1.0 and 1.0
 */
export function cosineSimilarity(vecA = [], vecB = []) {
  if (!vecA.length || !vecB.length) return 0;

  const minLength = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLength; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Performs vector similarity search over a collection of items.
 * @param {Array<number>} queryVector - Query embedding vector
 * @param {Array<Object>} documents - Array of document items with an `embedding` field
 * @param {number} topK - Number of top results to return
 * @param {Function} [filterFn] - Optional boolean filter predicate (doc) => boolean
 * @returns {Array<{ document: Object, score: number }>}
 */
export function searchSimilarVectors(queryVector, documents = [], topK = 3, filterFn = null) {
  if (!queryVector || !queryVector.length || !documents.length) {
    return [];
  }

  const scored = [];

  for (const doc of documents) {
    if (filterFn && !filterFn(doc)) {
      continue;
    }

    if (doc.embedding && doc.embedding.length > 0) {
      const score = cosineSimilarity(queryVector, doc.embedding);
      scored.push({ document: doc, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
