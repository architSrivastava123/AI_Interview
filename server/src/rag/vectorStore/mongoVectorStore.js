/**
 * mongoVectorStore.js
 * Manages ingestion, indexing, and retrieval of RAG knowledge vectors.
 */

import { KnowledgeDoc } from '../../models/KnowledgeDoc.js';
import { loadKnowledgeDocuments } from '../loaders/markdownLoader.js';
import { getEmbedding } from '../embeddings/embeddingService.js';
import { searchSimilarVectors } from './vectorStore.js';

let inMemoryKnowledgeCache = [];

/**
 * Initializes and indexes knowledge base markdown files into MongoDB and in-memory cache.
 * Called once during server boot.
 */
export async function initializeKnowledgeBase() {
  try {
    const rawDocs = loadKnowledgeDocuments();
    console.log(`[RAG] Loaded ${rawDocs.length} knowledge base chunks from markdown.`);

    // Check if docs already exist in MongoDB
    let existingCount = 0;
    try {
      existingCount = await KnowledgeDoc.countDocuments();
    } catch {
      // MongoDB may not be connected yet
    }

    if (existingCount === 0 && rawDocs.length > 0) {
      console.log('[RAG] Ingesting knowledge documents and generating embeddings...');
      const docsToInsert = [];

      for (const doc of rawDocs) {
        const embedding = await getEmbedding(`${doc.title} ${doc.topic} ${doc.content}`);
        docsToInsert.push({
          ...doc,
          embedding,
        });
      }

      try {
        await KnowledgeDoc.insertMany(docsToInsert);
        console.log(`[RAG] Successfully stored ${docsToInsert.length} vector documents in MongoDB.`);
      } catch (err) {
        console.warn(`[RAG] MongoDB insert failed, keeping in memory: ${err.message}`);
      }

      inMemoryKnowledgeCache = docsToInsert;
    } else {
      // Load from DB to memory cache for fast cosine search
      try {
        inMemoryKnowledgeCache = await KnowledgeDoc.find({}).lean();
        console.log(`[RAG] Cached ${inMemoryKnowledgeCache.length} knowledge vectors in memory.`);
      } catch {
        inMemoryKnowledgeCache = rawDocs;
      }
    }
  } catch (error) {
    console.error('[RAG] Knowledge base initialization error:', error.message);
  }
}

/**
 * Searches the knowledge vector store for context relevant to a query/topic.
 * @param {string} query
 * @param {Object} [filter] - { topic, technology, role, difficulty }
 * @param {number} [topK=3]
 * @returns {Promise<Array<{ document: Object, score: number }>>}
 */
export async function searchKnowledgeBase(query, filter = {}, topK = 3) {
  const queryEmbedding = await getEmbedding(query);

  let docs = inMemoryKnowledgeCache;
  if (!docs || docs.length === 0) {
    try {
      docs = await KnowledgeDoc.find({}).lean();
      inMemoryKnowledgeCache = docs;
    } catch {
      docs = [];
    }
  }

  const filterFn = (doc) => {
    if (filter.topic && doc.topic && doc.topic.toLowerCase() !== filter.topic.toLowerCase()) {
      return false;
    }
    if (filter.technology && doc.technology && doc.technology.toLowerCase() !== filter.technology.toLowerCase()) {
      return false;
    }
    return true;
  };

  return searchSimilarVectors(queryEmbedding, docs, topK, Object.keys(filter).length > 0 ? filterFn : null);
}
