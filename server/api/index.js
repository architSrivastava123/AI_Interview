/**
 * server/api/index.js
 * Vercel Serverless Function entry point for standalone server deployment.
 */

import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { initializeKnowledgeBase } from '../src/rag/vectorStore/mongoVectorStore.js';

let isInitialized = false;

export default async function handler(req, res) {
  if (!isInitialized) {
    try {
      await connectDB();
      await initializeKnowledgeBase();
      isInitialized = true;
    } catch (err) {
      console.warn('Vercel serverless init notice:', err.message);
    }
  }

  return app(req, res);
}
