/**
 * client/scripts/build.js
 */

import { execSync } from 'child_process';

console.log('📦 Running build from client directory...');
execSync('npm run build', { stdio: 'inherit' });
