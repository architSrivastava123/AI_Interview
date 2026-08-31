/**
 * server/index.js
 * Root entrypoint for Vercel / serverless runtime.
 */

import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { initializeKnowledgeBase } from './src/rag/vectorStore/mongoVectorStore.js';

let isInitialized = false;

export default async function handler(req, res) {
  if (!isInitialized) {
    try {
      await connectDB();
      await initializeKnowledgeBase();
      isInitialized = true;
    } catch (err) {
      console.warn('Vercel init notice:', err.message);
    }
  }
  return app(req, res);
}

export { app };
