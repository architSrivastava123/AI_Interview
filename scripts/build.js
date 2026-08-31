/**
 * scripts/build.js
 * Universal build script that works regardless of whether Vercel runs from repository root or from /client.
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const isClientDir = fs.existsSync(path.resolve(process.cwd(), 'client/package.json'));

if (isClientDir) {
  console.log('📦 Running build from root monorepo directory...');
  execSync('npm install --prefix client && npm run build --prefix client', { stdio: 'inherit' });
} else {
  console.log('📦 Running build from client directory...');
  execSync('npm install && npm run build', { stdio: 'inherit' });
}
