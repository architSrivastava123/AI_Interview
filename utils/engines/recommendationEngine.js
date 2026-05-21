/**
 * recommendationEngine.js
 *
 * Personalized skill-gap-based recommendation generation for AI Mock Interview.
 * Maps identified weaknesses to curated learning resources and generates
 * a prioritized improvement plan for each candidate.
 * All functions are pure — no DB or network dependencies.
 */

// ─── Resource Library ─────────────────────────────────────────────────────────

/**
 * Curated learning resource map keyed by skill/topic.
 * Each entry contains multiple resource options at different levels.
 */
export const RESOURCE_LIBRARY = {
  // Technical Skills
  react: {
    title: 'React Deep Dive',
    resources: [
      { title: 'React Official Docs', url: 'https://react.dev', type: 'docs', hours: 4 },
      { title: 'React Patterns & Best Practices', url: 'https://reactpatterns.com', type: 'article', hours: 2 },
    ],
  },
  'system design': {
    title: 'System Design Fundamentals',
    resources: [
      { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'github', hours: 8 },
      { title: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net', type: 'book', hours: 20 },
    ],
  },
  algorithms: {
    title: 'Data Structures & Algorithms',
    resources: [
      { title: 'LeetCode Practice', url: 'https://leetcode.com', type: 'practice', hours: 10 },
      { title: 'NeetCode 150', url: 'https://neetcode.io', type: 'course', hours: 15 },
    ],
  },
  databases: {
    title: 'Database Design & SQL',
    resources: [
      { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com', type: 'tutorial', hours: 4 },
      { title: 'SQL Mode Analytics', url: 'https://mode.com/sql-tutorial', type: 'tutorial', hours: 3 },
    ],
  },
  nodejs: {
    title: 'Node.js & Server-Side JS',
    resources: [
      { title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices', type: 'github', hours: 5 },
    ],
  },
  docker: {
    title: 'Containerization with Docker',
    resources: [
      { title: 'Docker Official Get Started', url: 'https://docs.docker.com/get-started', type: 'docs', hours: 3 },
    ],
  },
  // Communication / Soft Skills
  fluency: {
    title: 'Communication & Interview Fluency',
    resources: [
      { title: 'Toastmasters Communication Guide', url: 'https://www.toastmasters.org/resources', type: 'article', hours: 2 },
      { title: 'Interview Speech Practice Drills', url: 'https://biginterview.com', type: 'course', hours: 3 },
    ],
  },
  pace: {
    title: 'Speaking Pace & Delivery',
    resources: [
      { title: 'Public Speaking Pace Techniques', url: 'https://www.coursera.org/learn/public-speaking', type: 'course', hours: 4 },
      { title: 'Mirror Practice: Record & Review', url: 'https://www.loom.com', type: 'tool', hours: 1 },
    ],
  },
  confidence: {
    title: 'Interview Confidence Building',
    resources: [
      { title: 'Behavioral Interview Prep', url: 'https://www.themuse.com/advice/behavioral-interview-questions-answers-examples', type: 'article', hours: 2 },
      { title: 'STAR Method Practice', url: 'https://interviewsteps.com/blogs/news/amazon-star-method', type: 'article', hours: 1 },
    ],
  },
  // Domain-specific
  'machine learning': {
    title: 'ML Fundamentals',
    resources: [
      { title: 'Fast.ai Practical Deep Learning', url: 'https://course.fast.ai', type: 'course', hours: 20 },
      { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'course', hours: 10 },
    ],
  },
  cloud: {
    title: 'Cloud Architecture (AWS/GCP/Azure)',
    resources: [
      { title: 'AWS Cloud Practitioner Essentials', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials', type: 'course', hours: 6 },
    ],
  },
  devops: {
    title: 'DevOps Practices',
    resources: [
      { title: 'DevOps Roadmap', url: 'https://roadmap.sh/devops', type: 'roadmap', hours: 8 },
      { title: 'Kubernetes Official Tutorial', url: 'https://kubernetes.io/docs/tutorials', type: 'docs', hours: 6 },
    ],
  },
};

/** Domain → weak skill mappings for recommendation generation */
export const DOMAIN_SKILL_MAP = {
  Frontend:   ['react', 'algorithms', 'databases', 'pace', 'fluency'],
  Backend:    ['nodejs', 'databases', 'system design', 'algorithms', 'pace'],
  'Full Stack': ['react', 'nodejs', 'databases', 'system design', 'fluency'],
  'Data Science': ['machine learning', 'algorithms', 'databases', 'fluency', 'confidence'],
  'Machine Learning': ['machine learning', 'algorithms', 'confidence', 'fluency'],
  DevOps:     ['docker', 'cloud', 'devops', 'confidence', 'pace'],
  'Product Manager': ['confidence', 'fluency', 'pace', 'system design'],
  Cybersecurity: ['algorithms', 'system design', 'confidence', 'databases'],
  General:    ['fluency', 'confidence', 'pace', 'algorithms', 'system design'],
};

// ─── Core Recommendation Functions ───────────────────────────────────────────

/**
 * Identifies skills needing improvement from a skill gap matrix.
 * Returns skills where the candidate is more than 10 points below target.
 *
 * @param {Object} skillGapMatrix - Output of computeSkillGapMatrix()
 * @returns {Array<{dimension: string, gap: number, status: string}>}
 */
export function identifyWeakSkills(skillGapMatrix) {
  if (!skillGapMatrix || !Array.isArray(skillGapMatrix.dimensions)) return [];

  return skillGapMatrix.dimensions
    .filter(d => d.status === 'critical' || d.status === 'needs-work')
    .sort((a, b) => a.gap - b.gap); // most negative gap first (worst first)
}

/**
 * Maps identified weak dimensions to curated learning resources.
 *
 * @param {Array<{dimension: string}>} weakSkills - Output of identifyWeakSkills()
 * @param {string} track - Interview domain track
 * @returns {Array<Object>} Recommendation objects (not yet prioritized)
 */
export function mapSkillsToResources(weakSkills, track = 'General') {
  const domainSkills = DOMAIN_SKILL_MAP[track] || DOMAIN_SKILL_MAP.General;
  const recommendations = [];

  // First, handle dimension-based weaknesses
  for (const skill of weakSkills) {
    const dim = skill.dimension;
    const resourceKey = dim === 'technical' ? (domainSkills[0] || 'algorithms') : dim;
    const resource = RESOURCE_LIBRARY[resourceKey] || RESOURCE_LIBRARY.fluency;

    recommendations.push({
      category: 'skill-gap',
      title: resource.title,
      description: `Your ${dim} score is below the target benchmark. Focus on improving ${dim} through structured practice.`,
      resourceUrl: resource.resources[0]?.url || '',
      resourceType: resource.resources[0]?.type || 'article',
      targetSkill: dim,
      estimatedHours: resource.resources[0]?.hours || 2,
      impactScore: Math.abs(skill.gap) * 1.5,
      priority: skill.status === 'critical' ? 1 : 3,
      difficulty: 'Medium',
    });
  }

  // Always add at least one domain-specific technical resource
  const topDomainSkill = domainSkills[0];
  if (topDomainSkill && RESOURCE_LIBRARY[topDomainSkill]) {
    const res = RESOURCE_LIBRARY[topDomainSkill];
    const prefixedTitle = `${track} Core: ${res.title}`;
    // Only skip if the exact prefixed title already exists
    if (!recommendations.some(r => r.title === prefixedTitle)) {
      recommendations.push({
        category: 'domain-focus',
        title: prefixedTitle,
        description: `Strengthen your core ${track} technical skills to stay competitive in the job market.`,
        resourceUrl: res.resources[0]?.url || '',
        resourceType: res.resources[0]?.type || 'article',
        targetSkill: topDomainSkill,
        estimatedHours: res.resources[0]?.hours || 3,
        impactScore: 20,
        priority: 2,
        difficulty: 'Medium',
      });
    }
  }


  return recommendations;
}

/**
 * Generates a full recommendation set for a candidate based on their session history.
 *
 * @param {Array<Object>} sessions - InterviewSession records
 * @param {Array<Object>} scores - CandidateScore records
 * @param {string} userEmail
 * @param {string} preferredTrack - Candidate's primary interview track
 * @returns {Array<Object>} Full recommendation list
 */
export function generateRecommendations(sessions, scores, userEmail, preferredTrack = 'General') {
  const { computeSkillGapMatrix } = require('./analyticsEngine');

  const skillGap = computeSkillGapMatrix(scores, preferredTrack);
  const weakSkills = identifyWeakSkills(skillGap);
  const baseRecommendations = mapSkillsToResources(weakSkills, preferredTrack);

  // Add next interview suggestion
  const nextSuggestion = getNextInterviewSuggestion(sessions);
  if (nextSuggestion) {
    baseRecommendations.push({
      category: 'next-session',
      title: `Recommended Next Interview: ${nextSuggestion.track}`,
      description: nextSuggestion.reason,
      resourceUrl: '',
      resourceType: 'action',
      targetSkill: 'practice',
      estimatedHours: 1,
      impactScore: 25,
      priority: 2,
      difficulty: nextSuggestion.difficulty,
    });
  }

  // Add difficulty ramp recommendation if applicable
  const rampPlan = getDifficultyRampPlan(sessions);
  if (rampPlan && rampPlan.length > 0) {
    const nextStep = rampPlan[0];
    baseRecommendations.push({
      category: 'difficulty-ramp',
      title: `Level Up: Try ${nextStep.difficulty} Questions`,
      description: `You're ready to tackle ${nextStep.difficulty} difficulty questions. This will push your growth faster.`,
      resourceUrl: '',
      resourceType: 'action',
      targetSkill: 'challenge',
      estimatedHours: 0.5,
      impactScore: 18,
      priority: 4,
      difficulty: nextStep.difficulty,
    });
  }

  return prioritizeRecommendations(
    baseRecommendations.map(r => ({ ...r, userEmail, createdAt: new Date().toISOString() }))
  );
}

/**
 * Prioritizes recommendations by impact score descending, then priority ascending.
 *
 * @param {Array<Object>} recommendations
 * @returns {Array<Object>} Sorted recommendations
 */
export function prioritizeRecommendations(recommendations) {
  if (!Array.isArray(recommendations)) return [];
  return [...recommendations].sort((a, b) => {
    const priorityDiff = (Number(a.priority) || 5) - (Number(b.priority) || 5);
    if (priorityDiff !== 0) return priorityDiff;
    return (Number(b.impactScore) || 0) - (Number(a.impactScore) || 0);
  });
}

/**
 * Suggests the next interview track to practice based on session history.
 * Balances variety and weak-area focus.
 *
 * @param {Array<Object>} sessions
 * @returns {{track: string, reason: string, difficulty: string} | null}
 */
export function getNextInterviewSuggestion(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      track: 'General',
      reason: 'Start with a General interview to establish your baseline performance.',
      difficulty: 'Easy',
    };
  }

  // Find domain with fewest sessions and lowest avg score
  const domainStats = {};
  for (const session of sessions) {
    const domain = session.jobTrack || session.interviewTrack || 'General';
    if (!domainStats[domain]) domainStats[domain] = { count: 0, totalScore: 0 };
    domainStats[domain].count++;
    domainStats[domain].totalScore += Number(session.compositeScore) || 0;
  }

  const lastTrack = sessions[sessions.length - 1]?.jobTrack || 'General';
  const allTracks = Object.keys(DOMAIN_SKILL_MAP);

  // Find an untried track
  const untried = allTracks.find(t => !domainStats[t] && t !== lastTrack);
  if (untried) {
    return {
      track: untried,
      reason: `You haven't tried ${untried} interviews yet. Expanding your domain coverage will make you more well-rounded.`,
      difficulty: sessions.length < 3 ? 'Easy' : 'Medium',
    };
  }

  // Find weakest practiced domain
  const weakestDomain = Object.entries(domainStats)
    .map(([domain, stats]) => ({ domain, avgScore: stats.totalScore / stats.count }))
    .sort((a, b) => a.avgScore - b.avgScore)[0];

  if (weakestDomain) {
    return {
      track: weakestDomain.domain,
      reason: `Your ${weakestDomain.domain} average score (${Math.round(weakestDomain.avgScore)}) has the most room for improvement. Focused practice here will have the highest impact.`,
      difficulty: weakestDomain.avgScore > 60 ? 'Hard' : 'Medium',
    };
  }

  return null;
}

/**
 * Generates a progressive difficulty ramp plan for a candidate.
 * Based on current average score, suggests when and how to level up.
 *
 * @param {Array<Object>} sessions
 * @returns {Array<{step: number, difficulty: string, targetScore: number, description: string}>}
 */
export function getDifficultyRampPlan(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return [
      { step: 1, difficulty: 'Easy', targetScore: 60, description: 'Complete 3 Easy sessions to build momentum.' },
      { step: 2, difficulty: 'Medium', targetScore: 72, description: 'Move to Medium when your avg score reaches 60+.' },
      { step: 3, difficulty: 'Hard', targetScore: 82, description: 'Advance to Hard questions when consistently above 72.' },
      { step: 4, difficulty: 'Expert', targetScore: 90, description: 'Take on Expert-level system design when you reach 82+.' },
    ];
  }

  const scores = sessions.map(s => Number(s.compositeScore) || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const sessionCount = sessions.length;

  const plan = [];
  if (avgScore < 60 || sessionCount < 3) {
    plan.push({ step: 1, difficulty: 'Easy', targetScore: 60, description: `Complete more Easy sessions. Current avg: ${Math.round(avgScore)}. Target: 60+.` });
  }
  if (avgScore < 72) {
    plan.push({ step: 2, difficulty: 'Medium', targetScore: 72, description: `Work on Medium difficulty to improve your score from ${Math.round(avgScore)} to 72+.` });
  }
  if (avgScore >= 60 && avgScore < 82) {
    plan.push({ step: 3, difficulty: 'Hard', targetScore: 82, description: `You're ready for Hard questions! Push yourself to reach 82+.` });
  }
  if (avgScore >= 82) {
    plan.push({ step: 4, difficulty: 'Expert', targetScore: 90, description: `Elite tier! Take on Expert system design and architecture challenges.` });
  }

  return plan;
}
