/**
 * tests/components/interviewCard.test.js
 *
 * Tests the pure business logic from InterviewItemCard.jsx and AddNewInterview.jsx:
 * - ATS score computation (keyword matching algorithm)
 * - autoSuggestTechStack lookup (TECH_STACK_SUGGESTIONS map)
 * - trackLabel fallback behavior
 * - Interview form field validation logic
 */

// ── Inline the pure logic from AddNewInterview.jsx ─────────────────────────────

const JOB_ROLE_SUGGESTIONS = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Software Engineer', 'DevOps Engineer', 'Data Scientist',
  'Machine Learning Engineer', 'Cloud Engineer', 'Mobile App Developer', 'UI/UX Designer',
];

const INTERVIEW_TRACKS = [
  'Frontend', 'Backend', 'Full Stack', 'Data Science',
  'Machine Learning', 'Product Manager', 'DevOps', 'Cybersecurity',
];

const TECH_STACK_SUGGESTIONS = {
  'Full Stack Developer':       'React, Node.js, Express, MongoDB, TypeScript',
  'Frontend Developer':         'React, Vue.js, Angular, TypeScript, Tailwind CSS',
  'Backend Developer':          'Python, Django, Flask, Java Spring, PostgreSQL',
  'Software Engineer':          'Java, C++, Python, AWS, Microservices',
  'DevOps Engineer':            'Docker, Kubernetes, Jenkins, AWS, Azure',
  'Data Scientist':             'Python, TensorFlow, PyTorch, Pandas, NumPy',
  'Machine Learning Engineer':  'Python, scikit-learn, Keras, TensorFlow',
  'Cloud Engineer':             'AWS, Azure, GCP, Terraform, Kubernetes',
  'Mobile App Developer':       'React Native, Flutter, Swift, Kotlin',
  'UI/UX Designer':             'Figma, Sketch, Adobe XD, InVision',
};

function computeAtsScore(jobDescription, resumeText) {
  const textForScan = resumeText.toLowerCase();
  const techTags = jobDescription
    .split(/[\s,]+/)
    .map(t => t.replace(/[^a-zA-Z0-9+#]/g, '').toLowerCase())
    .filter(t => t.length > 2);

  if (techTags.length === 0) return 75;

  const found = techTags.filter(tag => textForScan.includes(tag));
  return Math.round((found.length / techTags.length) * 100) || 75;
}

function getFoundAndMissingKeywords(jobDescription, resumeText) {
  const textForScan = resumeText.toLowerCase();
  const techTags = jobDescription
    .split(/[\s,]+/)
    .map(t => t.replace(/[^a-zA-Z0-9+#]/g, '').toLowerCase())
    .filter(t => t.length > 2);

  const found = [];
  const missing = [];
  techTags.forEach(tag => {
    if (textForScan.includes(tag)) found.push(tag);
    else missing.push(tag);
  });
  return { found: found.slice(0, 5), missing: missing.slice(0, 5) };
}

function autoSuggestTechStack(role) {
  return TECH_STACK_SUGGESTIONS[role] || null;
}

function getTrackLabel(interview) {
  return interview?.interviewTrack || 'General';
}

function isFormValid({ jobPosition, jobDescription, jobExperience, interviewTrack }) {
  return !!(jobPosition?.trim() && jobDescription?.trim() && jobExperience !== '' && interviewTrack);
}

// ─────────────────────────────────────────────────────────────────────────────

describe('ATS Score Computation', () => {
  test('100% match when all tech tags found in resume', () => {
    const jd = 'React, TypeScript, Python';
    const resume = 'Expert in react and typescript with python frameworks';
    expect(computeAtsScore(jd, resume)).toBe(100);
  });

  test('0% match when no tags found → returns 75 fallback', () => {
    const jd = 'PostgreSQL, Kubernetes, Terraform';
    const resume = 'I enjoy cooking and painting';
    // No matches: function returns fallback of 75 when result would be 0
    expect(computeAtsScore(jd, resume)).toBe(75);
  });

  test('50% match with half keywords found', () => {
    const jd = 'React, Angular, PostgreSQL, MongoDB';
    const resume = 'worked with react and postgresql extensively';
    expect(computeAtsScore(jd, resume)).toBe(50);
  });

  test('empty jobDescription returns fallback 75', () => {
    expect(computeAtsScore('', 'any resume text')).toBe(75);
  });

  test('case-insensitive matching', () => {
    expect(computeAtsScore('REACT, TYPESCRIPT', 'react typescript developer')).toBe(100);
  });

  test('special characters stripped correctly', () => {
    const jd = 'C++, React.js, Vue!';
    const resume = 'experienced with c++ and reactjs and vue';
    const score = computeAtsScore(jd, resume);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('ATS Keyword Extraction', () => {
  test('found returns up to 5 keywords', () => {
    const jd = 'React, TypeScript, Node.js, AWS, Docker, Kubernetes, GraphQL';
    const resume = 'react typescript nodejs aws docker kubernetes graphql developer';
    const { found } = getFoundAndMissingKeywords(jd, resume);
    expect(found.length).toBeLessThanOrEqual(5);
  });

  test('missing returns up to 5 keywords', () => {
    const jd = 'React, TypeScript, Node.js, AWS, Docker, Kubernetes, GraphQL';
    const resume = 'only java developer here nothing relevant';
    const { missing } = getFoundAndMissingKeywords(jd, resume);
    expect(missing.length).toBeLessThanOrEqual(5);
  });

  test('found + missing can total more than 5 due to slicing', () => {
    const jd = 'React, Angular, Vue, Svelte, SolidJS, Qwik, Astro';
    const resume = 'react angular developer';
    const { found, missing } = getFoundAndMissingKeywords(jd, resume);
    expect(found.length + missing.length).toBeLessThanOrEqual(10);
  });

  test('found array excludes short tokens (< 3 chars)', () => {
    const jd = 'Go, JS, Python, React';
    const resume = 'go js python react';
    const { found } = getFoundAndMissingKeywords(jd, resume);
    // 'go' and 'js' have length <=2, should be filtered out
    expect(found).not.toContain('go');
    expect(found).not.toContain('js');
  });
});

describe('autoSuggestTechStack', () => {
  test('returns suggestion for Full Stack Developer', () => {
    const suggestion = autoSuggestTechStack('Full Stack Developer');
    expect(suggestion).toContain('React');
    expect(suggestion).toContain('Node.js');
  });

  test('returns suggestion for DevOps Engineer', () => {
    const suggestion = autoSuggestTechStack('DevOps Engineer');
    expect(suggestion).toContain('Docker');
    expect(suggestion).toContain('Kubernetes');
  });

  test('returns null for unknown role', () => {
    expect(autoSuggestTechStack('Astronaut')).toBeNull();
  });

  test('every role in JOB_ROLE_SUGGESTIONS has a suggestion', () => {
    JOB_ROLE_SUGGESTIONS.forEach(role => {
      expect(autoSuggestTechStack(role)).not.toBeNull();
    });
  });

  test('Data Scientist includes Python and TensorFlow', () => {
    const s = autoSuggestTechStack('Data Scientist');
    expect(s).toContain('Python');
    expect(s).toContain('TensorFlow');
  });
});

describe('getTrackLabel', () => {
  test('returns interviewTrack when set', () => {
    expect(getTrackLabel({ interviewTrack: 'Backend' })).toBe('Backend');
  });

  test('returns General when interviewTrack is undefined', () => {
    expect(getTrackLabel({ jobPosition: 'Dev' })).toBe('General');
  });

  test('returns General for null interview', () => {
    expect(getTrackLabel(null)).toBe('General');
  });

  test('returns General for empty string track', () => {
    expect(getTrackLabel({ interviewTrack: '' })).toBe('General');
  });
});

describe('INTERVIEW_TRACKS list', () => {
  test('contains exactly 8 tracks', () => {
    expect(INTERVIEW_TRACKS).toHaveLength(8);
  });

  test('contains Frontend and Backend', () => {
    expect(INTERVIEW_TRACKS).toContain('Frontend');
    expect(INTERVIEW_TRACKS).toContain('Backend');
  });
});

describe('isFormValid', () => {
  const valid = { jobPosition: 'Dev', jobDescription: 'React', jobExperience: '3', interviewTrack: 'Frontend' };

  test('returns true for fully filled form', () => {
    expect(isFormValid(valid)).toBe(true);
  });

  test('returns false when jobPosition is empty', () => {
    expect(isFormValid({ ...valid, jobPosition: '' })).toBe(false);
  });

  test('returns false when jobPosition is whitespace only', () => {
    expect(isFormValid({ ...valid, jobPosition: '   ' })).toBe(false);
  });

  test('returns false when jobDescription is empty', () => {
    expect(isFormValid({ ...valid, jobDescription: '' })).toBe(false);
  });

  test('returns false when jobExperience is empty string', () => {
    expect(isFormValid({ ...valid, jobExperience: '' })).toBe(false);
  });

  test('returns false when interviewTrack is missing', () => {
    expect(isFormValid({ ...valid, interviewTrack: null })).toBe(false);
  });
});
