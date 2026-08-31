/**
 * markdownLoader.js
 * Scans the /knowledge directory, parses markdown frontmatter, and splits documents into chunks.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Splits text into chunks with overlap.
 * @param {string} text
 * @param {number} chunkSize
 * @param {number} chunkOverlap
 * @returns {Array<string>}
 */
export function splitTextIntoChunks(text, chunkSize = 600, chunkOverlap = 100) {
  if (!text) return [];
  const clean = text.replace(/\r\n/g, '\n').trim();
  if (clean.length <= chunkSize) return [clean];

  const chunks = [];
  let startIndex = 0;

  while (startIndex < clean.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex < clean.length) {
      // Find a newline or sentence break near endIndex to avoid splitting words
      const nextBreak = clean.indexOf('\n\n', endIndex - 50);
      if (nextBreak !== -1 && nextBreak <= endIndex + 50) {
        endIndex = nextBreak + 2;
      } else {
        const nextPeriod = clean.indexOf('. ', endIndex - 30);
        if (nextPeriod !== -1 && nextPeriod <= endIndex + 30) {
          endIndex = nextPeriod + 2;
        }
      }
    } else {
      endIndex = clean.length;
    }

    const chunk = clean.slice(startIndex, endIndex).trim();
    if (chunk.length > 20) {
      chunks.push(chunk);
    }

    startIndex = endIndex - chunkOverlap;
    if (startIndex >= clean.length || endIndex >= clean.length) {
      break;
    }
  }

  return chunks;
}

/**
 * Recursively scans directory for .md files.
 * @param {string} dir
 * @returns {Array<string>} List of absolute filepaths
 */
function getMarkdownFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  }
  return results;
}

/**
 * Loads and parses all markdown documents in the knowledge directory.
 * @param {string} knowledgeDir
 * @returns {Array<Object>} Array of chunked documents with metadata
 */
export function loadKnowledgeDocuments(knowledgeDir) {
  const dir = knowledgeDir || path.resolve(__dirname, '../../../../knowledge');
  const files = getMarkdownFiles(dir);
  const documents = [];

  for (const filePath of files) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content } = matter(fileContent);

      const chunks = splitTextIntoChunks(content, 600, 100);

      chunks.forEach((chunk, index) => {
        documents.push({
          source: frontmatter.source || path.basename(filePath),
          title: frontmatter.title || path.basename(filePath, '.md'),
          topic: frontmatter.topic || 'General',
          difficulty: frontmatter.difficulty || 'medium',
          role: frontmatter.role || 'general',
          technology: frontmatter.technology || 'General',
          chunkIndex: index,
          content: chunk,
        });
      });
    } catch (err) {
      console.warn(`Could not parse knowledge file: ${filePath}`, err.message);
    }
  }

  return documents;
}
