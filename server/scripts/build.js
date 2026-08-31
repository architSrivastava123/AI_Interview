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

  // Ensure index.js and server.js exist in dist
  if (fs.existsSync(path.join(distDir, 'server.js'))) {
    fs.copyFileSync(path.join(distDir, 'server.js'), path.join(distDir, 'index.js'));
  } else if (fs.existsSync(path.join(distDir, 'app.js'))) {
    fs.copyFileSync(path.join(distDir, 'app.js'), path.join(distDir, 'index.js'));
  }
}

console.log('✅ MockMate Backend serverless build ready with entrypoint in dist/index.js');
process.exit(0);
