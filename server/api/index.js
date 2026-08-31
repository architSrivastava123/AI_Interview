/**
 * server/api/index.js
 * Vercel Serverless Function entry point for standalone server deployment.
 */

import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { initializeKnowledgeBase } from '../src/rag/vectorStore/mongoVectorStore.js';

let isInitialized = false;

export default async function handler(req, res) {
  // Direct preflight handling for Vercel Serverless Functions
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

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
