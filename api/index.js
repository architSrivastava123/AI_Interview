/**
 * api/index.js
 * Vercel Serverless Function Entry Point for Express REST API.
 */

import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { initializeKnowledgeBase } from '../server/src/rag/vectorStore/mongoVectorStore.js';

let isInitialized = false;

export default async function handler(req, res) {
  if (!isInitialized) {
    try {
      await connectDB();
      await initializeKnowledgeBase();
      isInitialized = true;
    } catch (err) {
      console.warn('Vercel initialization notice:', err.message);
    }
  }

  return app(req, res);
}
