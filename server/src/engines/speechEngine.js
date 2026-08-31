/**
 * speechEngine.js
 * Deterministic speech metric calculations: word count, WPM, filler word detection.
 * Pure functions with zero external dependencies.
 */

import { FILLER_WORDS } from '../config/constants.js';

/**
 * Analyzes candidate transcript text and computes speech delivery metrics.
 * @param {string} transcriptText - Transcribed spoken answer
 * @param {number} durationSeconds - Duration in seconds
 * @returns {Object} Speech metrics object
 */
export function analyzeSpeech(transcriptText = '', durationSeconds = 0) {
  const text = String(transcriptText || '').trim();
  const duration = Math.max(0, Number(durationSeconds) || 0);

  if (!text) {
    return {
      durationSeconds: duration,
      wordCount: 0,
      wpm: 0,
      fillerCount: 0,
      fillerWords: [],
      fillerDensity: 0,
    };
  }

  // Word count (strip punctuation)
  const cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ');
  const words = cleaned.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // WPM (Words Per Minute)
  const wpm = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;

  // Filler word detection
  const lowerText = text.toLowerCase();
  const detectedFillers = [];
  let fillerCount = 0;

  for (const filler of FILLER_WORDS) {
    const escaped = filler.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      fillerCount += matches.length;
      for (let i = 0; i < matches.length; i++) {
        detectedFillers.push(filler);
      }
    }
  }

  const fillerDensity = wordCount > 0 ? Math.round((fillerCount / wordCount) * 1000) / 1000 : 0;

  return {
    durationSeconds: duration,
    wordCount,
    wpm,
    fillerCount,
    fillerWords: detectedFillers,
    fillerDensity,
  };
}
