/**
 * scripts/build.js
 * Universal build script that creates dist in both root and client/dist
 * so Vercel will always find the output directory regardless of project root settings.
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const isRoot = fs.existsSync(path.resolve(process.cwd(), 'client/package.json'));

if (isRoot) {
  console.log('📦 Running build from root monorepo directory...');
  execSync('npm install --prefix client && npm run build --prefix client', { stdio: 'inherit' });

  // Ensure root ./dist exists by mirroring client/dist
  if (fs.existsSync(path.resolve(process.cwd(), 'client/dist'))) {
    console.log('📦 Syncing client/dist to ./dist for Vercel...');
    fs.cpSync(path.resolve(process.cwd(), 'client/dist'), path.resolve(process.cwd(), 'dist'), { recursive: true });
  }
} else {
  console.log('📦 Running build from client directory...');
  execSync('npm install && npm run build', { stdio: 'inherit' });
}
