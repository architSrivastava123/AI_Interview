/**
 * scripts/build.js
 * Universal build script that creates hybrid frontend & backend artifacts in dist
 * satisfying Vite, Express, and Serverless presets across all Vercel configurations.
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const isRoot = fs.existsSync(path.resolve(process.cwd(), 'client/package.json'));

if (isRoot) {
  console.log('📦 Running full monorepo build...');
  execSync('npm install --prefix client && npm run build --prefix client', { stdio: 'inherit' });

  const rootDist = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(rootDist)) {
    fs.mkdirSync(rootDist, { recursive: true });
  }

  // 1. Copy client build artifacts (index.html, assets)
  const clientDist = path.resolve(process.cwd(), 'client/dist');
  if (fs.existsSync(clientDist)) {
    console.log('📦 Syncing client/dist to ./dist...');
    fs.cpSync(clientDist, rootDist, { recursive: true });
  }

  // 2. Copy server backend entrypoints into dist
  const serverSrc = path.resolve(process.cwd(), 'server/src');
  if (fs.existsSync(serverSrc)) {
    console.log('📦 Injecting server entrypoints into ./dist...');
    fs.cpSync(serverSrc, path.join(rootDist, 'src'), { recursive: true });
  }

  // 3. Create top-level backend entrypoint files in dist
  const appSrc = path.resolve(process.cwd(), 'server/src/app.js');
  const serverSrcFile = path.resolve(process.cwd(), 'server/src/server.js');
  const apiHandler = path.resolve(process.cwd(), 'api/index.js');

  if (fs.existsSync(appSrc)) {
    fs.copyFileSync(appSrc, path.join(rootDist, 'app.js'));
  }
  if (fs.existsSync(serverSrcFile)) {
    fs.copyFileSync(serverSrcFile, path.join(rootDist, 'server.js'));
  }
  if (fs.existsSync(apiHandler)) {
    fs.copyFileSync(apiHandler, path.join(rootDist, 'index.js'));
  } else if (fs.existsSync(serverSrcFile)) {
    fs.copyFileSync(serverSrcFile, path.join(rootDist, 'index.js'));
  }

  // 4. Copy knowledge base for RAG
  const knowledgeDir = path.resolve(process.cwd(), 'knowledge');
  if (fs.existsSync(knowledgeDir)) {
    fs.cpSync(knowledgeDir, path.join(rootDist, 'knowledge'), { recursive: true });
  }

  // 5. Copy package.json with ES module support
  const rootPkg = path.resolve(process.cwd(), 'package.json');
  if (fs.existsSync(rootPkg)) {
    fs.copyFileSync(rootPkg, path.join(rootDist, 'package.json'));
  }

  console.log('✅ Full monorepo dist bundle ready with frontend & backend entrypoints.');
} else {
  console.log('📦 Running build from client/server directory...');
  execSync('npm install && npm run build', { stdio: 'inherit' });
}
