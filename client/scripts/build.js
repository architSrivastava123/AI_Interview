/**
 * client/scripts/build.js
 */

import { execSync } from 'child_process';

console.log('📦 Running Vite client production build...');
execSync('npx vite build', { stdio: 'inherit' });
