/**
 * server/scripts/build.js
 * Builds backend output directory for Vercel Node runtime.
 */

import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const srcDir = path.resolve(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, distDir, { recursive: true });

  // Create src subdirectory in dist as well
  const distSrcDir = path.join(distDir, 'src');
  if (!fs.existsSync(distSrcDir)) {
    fs.mkdirSync(distSrcDir, { recursive: true });
    fs.cpSync(srcDir, distSrcDir, { recursive: true });
  }

  // Ensure all standard entrypoints exist
  const serverPath = path.join(distDir, 'server.js');
  const appPath = path.join(distDir, 'app.js');
  const indexPath = path.join(distDir, 'index.js');

  if (fs.existsSync(serverPath) && !fs.existsSync(indexPath)) {
    fs.copyFileSync(serverPath, indexPath);
  }
  if (fs.existsSync(appPath) && !fs.existsSync(serverPath)) {
    fs.copyFileSync(appPath, serverPath);
  }
  if (!fs.existsSync(appPath) && fs.existsSync(serverPath)) {
    fs.copyFileSync(serverPath, appPath);
  }
}

// Ensure knowledge base directory is copied for RAG
const rootKnowledge = path.resolve(process.cwd(), '../knowledge');
const localKnowledge = path.resolve(process.cwd(), 'knowledge');
const distKnowledge = path.resolve(distDir, 'knowledge');

if (fs.existsSync(rootKnowledge) && !fs.existsSync(distKnowledge)) {
  fs.cpSync(rootKnowledge, distKnowledge, { recursive: true });
} else if (fs.existsSync(localKnowledge) && !fs.existsSync(distKnowledge)) {
  fs.cpSync(localKnowledge, distKnowledge, { recursive: true });
}

console.log('✅ MockMate Backend serverless build ready with verified entrypoints in dist/.');
process.exit(0);
