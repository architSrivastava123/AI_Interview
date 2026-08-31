/**
 * skillGapEngine.js
 * Analyzes candidate performance across dimensions against role-specific benchmarks.
 * Identifies strong areas, areas needing work, and critical gaps.
 */

import { ROLE_TARGETS } from '../config/constants.js';

/**
 * Computes skill gaps for candidate dimension averages against target role benchmarks.
 * @param {Object} dimensionAverages - { technical, fluency, pace, confidence, communication }
 * @param {string} targetRole - Job role (Frontend, Backend, Full Stack, etc.)
 * @returns {Array<{ dimension: string, candidateAvg: number, target: number, gap: number, status: string }>}
 */
export function computeSkillGaps(dimensionAverages = {}, targetRole = 'General') {
  const normalizedRole = Object.keys(ROLE_TARGETS).find(
    r => r.toLowerCase() === (targetRole || '').toLowerCase()
  ) || 'General';

  const targets = ROLE_TARGETS[normalizedRole] || ROLE_TARGETS.General;
  const dimensions = ['technical', 'fluency', 'pace', 'confidence', 'communication'];

  return dimensions.map(dim => {
    const candidateAvg = Math.round(Number(dimensionAverages[dim]) || 0);
    const target = targets[dim] || 70;
    const gap = candidateAvg - target;

    let status = 'needs-work';
    if (gap >= 5) {
      status = 'strong';
    } else if (gap >= -5) {
      status = 'on-track';
    } else if (gap >= -15) {
      status = 'needs-work';
    } else {
      status = 'critical';
    }

    return {
      dimension: dim,
      candidateAvg,
      target,
      gap,
      status,
    };
  });
}
