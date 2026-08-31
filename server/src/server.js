/**
 * server.js
 * Server startup bootstrap: starts Express immediately, connects MongoDB and initializes RAG knowledge base.
 */

import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initializeKnowledgeBase } from './rag/vectorStore/mongoVectorStore.js';

async function startServer() {
  console.log('🚀 Starting MockMate AI Server...');

  // 1. Start HTTP Server immediately
  const server = app.listen(env.PORT, () => {
    console.log(`📡 MockMate Server listening on port ${env.PORT} (http://localhost:${env.PORT})`);
  });

  // 2. Connect MongoDB & Ingest Knowledge Base asynchronously
  try {
    await connectDB();
    await initializeKnowledgeBase();
  } catch (err) {
    console.warn('Background initialization notice:', err.message);
  }

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Server failed to start:', err);
  });
}

export { startServer };
