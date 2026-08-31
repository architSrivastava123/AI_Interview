/**
 * recommendationEngine.js
 * Generates prioritized, actionable practice recommendations based on candidate skill gaps and target role.
 */

const RESOURCE_MAP = {
  technical: {
    react: {
      title: 'React Hooks & State Architecture',
      action: 'Review React reconciliation and custom hooks lifecycle. Practice building an optimized component tree.',
      resourceUrl: 'https://react.dev/learn',
      resourceType: 'docs',
      hours: 3,
    },
    mongodb: {
      title: 'MongoDB Query Optimization & Indexing',
      action: 'Practice creating compound indexes (ESR rule) and analyzing aggregation pipelines with explain("executionStats").',
      resourceUrl: 'https://www.mongodb.com/docs/manual/indexes/',
      resourceType: 'docs',
      hours: 4,
    },
    express: {
      title: 'Express.js Middleware & REST API Design',
      action: 'Implement centralized error handling middleware and validate request payloads with Zod schemas.',
      resourceUrl: 'https://expressjs.com/en/guide/using-middleware.html',
      resourceType: 'article',
      hours: 2,
    },
    system_design: {
      title: 'System Design & Scalability Patterns',
      action: 'Study database partitioning, cache-aside strategies, and microservices decoupling patterns.',
      resourceUrl: 'https://github.com/donnemartin/system-design-primer',
      resourceType: 'github',
      hours: 6,
    },
    default: {
      title: 'Core Technical Fundamentals & DSA',
      action: 'Deepen foundational computer science concepts and solve medium-difficulty algorithmic problems.',
      resourceUrl: 'https://neetcode.io',
      resourceType: 'practice',
      hours: 5,
    },
  },
  fluency: {
    title: 'Interview Fluency & Filler Word Reduction',
    action: 'Practice timed 2-minute answers using brief silent pauses rather than filler words like "um" and "like".',
    resourceUrl: 'https://www.toastmasters.org/resources',
    resourceType: 'article',
    hours: 2,
  },
  pace: {
    title: 'Speaking Pace & Delivery Modulation',
    action: 'Target 120–140 words per minute. Record your answers on a timer to avoid speaking too fast or slow.',
    resourceUrl: 'https://biginterview.com',
    resourceType: 'course',
    hours: 2,
  },
  confidence: {
    title: 'Structured STAR Delivery for Technical Behavioral Questions',
    action: 'Structure your answers clearly into Situation, Task, Action (50%), and measurable Result (20%).',
    resourceUrl: 'https://interviewsteps.com',
    resourceType: 'article',
    hours: 2,
  },
  communication: {
    title: 'Architectural Explanation Clarity & Trade-off Framing',
    action: 'Whenever explaining technical decisions, clearly state the trade-offs, performance impact, and alternative options considered.',
    resourceUrl: 'https://martinfowler.com/architecture/',
    resourceType: 'article',
    hours: 3,
  },
};

/**
 * Generates personalized practice recommendations from skill gaps.
 * @param {Array<Object>} skillGaps - Array from computeSkillGaps
 * @param {string} targetRole
 * @param {Array<string>} missingConcepts - Concepts missed during the interview
 * @returns {Array<Object>}
 */
export function generateRecommendations(skillGaps = [], targetRole = 'Frontend', missingConcepts = []) {
  const recommendations = [];

  for (const gap of skillGaps) {
    if (gap.status === 'critical' || gap.status === 'needs-work') {
      const dim = gap.dimension;
      let resource;

      if (dim === 'technical') {
        const roleLower = (targetRole || '').toLowerCase();
        if (roleLower.includes('front') || roleLower.includes('react')) {
          resource = RESOURCE_MAP.technical.react;
        } else if (roleLower.includes('back') || roleLower.includes('node')) {
          resource = RESOURCE_MAP.technical.express;
        } else if (roleLower.includes('data') || roleLower.includes('mongo')) {
          resource = RESOURCE_MAP.technical.mongodb;
        } else {
          resource = RESOURCE_MAP.technical.default;
        }
      } else {
        resource = RESOURCE_MAP[dim] || RESOURCE_MAP.confidence;
      }

      recommendations.push({
        category: 'skill-gap',
        skill: `${targetRole} - ${dim.charAt(0).toUpperCase() + dim.slice(1)}`,
        title: resource.title,
        priority: gap.status === 'critical' ? 'high' : 'medium',
        reason: `Your ${dim} score is ${Math.abs(gap.gap)} points below target for ${targetRole} positions.`,
        action: resource.action,
        resourceUrl: resource.resourceUrl,
        resourceType: resource.resourceType,
        estimatedHours: resource.hours,
        difficulty: gap.status === 'critical' ? 'Medium' : 'Hard',
        isCompleted: false,
      });
    }
  }

  // If specific missing concepts were logged
  if (missingConcepts.length > 0) {
    const topConcept = missingConcepts[0];
    recommendations.push({
      category: 'domain-focus',
      skill: topConcept,
      title: `Mastery Focus: ${topConcept}`,
      priority: 'high',
      reason: `You missed key concepts regarding ${topConcept} in technical question evaluations.`,
      action: `Review theoretical documentation on ${topConcept} and write a quick reference implementation.`,
      resourceUrl: 'https://developer.mozilla.org',
      resourceType: 'docs',
      estimatedHours: 2,
      difficulty: 'Medium',
      isCompleted: false,
    });
  }

  // If candidate performed excellently across all dimensions, give a stretch goal
  if (recommendations.length === 0) {
    recommendations.push({
      category: 'difficulty-ramp',
      skill: 'Advanced Architecture',
      title: 'Level Up: Take on Expert Distributed Systems',
      priority: 'low',
      reason: 'You exceeded target benchmarks across all evaluated dimensions.',
      action: 'Practice expert-level system design scenarios covering fault tolerance and data replication.',
      resourceUrl: 'https://dataintensive.net',
      resourceType: 'book',
      estimatedHours: 8,
      difficulty: 'Expert',
      isCompleted: false,
    });
  }

  return recommendations;
}
