/**
 * env.js
 * Validates and exports environment variables.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root or workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const ATLAS_FALLBACK_URI = 'mongodb+srv://architsrivastava159_db_user:zNAi4ycFfCwVmWji@cluster0.udqmwcd.mongodb.net/mockmate?retryWrites=true&w=majority';

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || ATLAS_FALLBACK_URI,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyCv8wfubhVJ-6K2Aw0JmaUcAp-7Gxl1GkU',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_test_3BL47LeuO7FYZUSf5YkU1VbUwPzvxCNkIBbmKkQ9ip',
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_ZXF1aXBwZWQtbWFsbGFyZC0wLmNsZXJrLmFjY291bnRzLmRldiQ',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
