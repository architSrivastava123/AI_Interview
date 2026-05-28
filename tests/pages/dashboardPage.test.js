/**
 * tests/pages/dashboardPage.test.js
 *
 * Tests the data-shaping and display logic for the main dashboard page.
 * Exercises: interview list filtering, sorting, date formatting,
 * search/filter logic, and pagination calculations — all as pure functions.
 */

// ── Data shaping logic (extracted from dashboard/page.jsx) ───────────────────

function filterInterviewsByTrack(interviews, track) {
  if (!track || track === 'All') return interviews;
  return interviews.filter(i => i.interviewTrack === track);
}

function searchInterviews(interviews, query) {
  if (!query) return interviews;
  const q = query.toLowerCase();
  return interviews.filter(i =>
    i.jobPosition?.toLowerCase().includes(q) ||
    i.jobDesc?.toLowerCase().includes(q)
  );
}

function sortInterviewsByDate(interviews, order = 'desc') {
  const sorted = [...interviews].sort((a, b) => {
    const da = a.createdAt || '';
    const db_ = b.createdAt || '';
    return order === 'asc'
      ? da.localeCompare(db_)
      : db_.localeCompare(da);
  });
  return sorted;
}

function paginateInterviews(interviews, page, perPage = 6) {
  const start = (page - 1) * perPage;
  return interviews.slice(start, start + perPage);
}

function getTotalPages(totalItems, perPage = 6) {
  return Math.max(1, Math.ceil(totalItems / perPage));
}

function getAvailableTracks(interviews) {
  const tracks = interviews.map(i => i.interviewTrack).filter(Boolean);
  return ['All', ...new Set(tracks)];
}

// ─────────────────────────────────────────────────────────────────────────────

const INTERVIEWS = [
  { mockId: 'a1', jobPosition: 'React Developer', jobDesc: 'React, TypeScript', interviewTrack: 'Frontend', createdAt: '05-05-2025', createdBy: 'u@t.com' },
  { mockId: 'a2', jobPosition: 'Node.js Engineer', jobDesc: 'Node, Express, MongoDB', interviewTrack: 'Backend', createdAt: '10-05-2025', createdBy: 'u@t.com' },
  { mockId: 'a3', jobPosition: 'Vue Developer', jobDesc: 'Vue.js, Vuex', interviewTrack: 'Frontend', createdAt: '12-05-2025', createdBy: 'u@t.com' },
  { mockId: 'a4', jobPosition: 'DevOps Engineer', jobDesc: 'Docker, Kubernetes', interviewTrack: 'DevOps', createdAt: '15-05-2025', createdBy: 'u@t.com' },
  { mockId: 'a5', jobPosition: 'Python Engineer', jobDesc: 'Django, Flask', interviewTrack: 'Backend', createdAt: '20-05-2025', createdBy: 'u@t.com' },
  { mockId: 'a6', jobPosition: 'Full Stack Dev', jobDesc: 'React, Node.js, PostgreSQL', interviewTrack: 'Full Stack', createdAt: '22-05-2025', createdBy: 'u@t.com' },
  { mockId: 'a7', jobPosition: 'Data Scientist', jobDesc: 'Python, Pandas, TensorFlow', interviewTrack: 'Data Science', createdAt: '25-05-2025', createdBy: 'u@t.com' },
];

// ── filterInterviewsByTrack ──────────────────────────────────────────────────

describe('filterInterviewsByTrack', () => {
  test('"All" returns all interviews', () => {
    expect(filterInterviewsByTrack(INTERVIEWS, 'All')).toHaveLength(INTERVIEWS.length);
  });

  test('null track returns all interviews', () => {
    expect(filterInterviewsByTrack(INTERVIEWS, null)).toHaveLength(INTERVIEWS.length);
  });

  test('Frontend returns 2 interviews', () => {
    expect(filterInterviewsByTrack(INTERVIEWS, 'Frontend')).toHaveLength(2);
  });

  test('Backend returns 2 interviews', () => {
    expect(filterInterviewsByTrack(INTERVIEWS, 'Backend')).toHaveLength(2);
  });

  test('DevOps returns 1 interview', () => {
    expect(filterInterviewsByTrack(INTERVIEWS, 'DevOps')).toHaveLength(1);
  });

  test('unknown track returns 0', () => {
    expect(filterInterviewsByTrack(INTERVIEWS, 'Cybersecurity')).toHaveLength(0);
  });

  test('empty interviews returns empty', () => {
    expect(filterInterviewsByTrack([], 'Frontend')).toHaveLength(0);
  });
});

// ── searchInterviews ─────────────────────────────────────────────────────────

describe('searchInterviews', () => {
  test('empty query returns all', () => {
    expect(searchInterviews(INTERVIEWS, '')).toHaveLength(INTERVIEWS.length);
  });

  test('case-insensitive: "react" finds React Developer and Full Stack Dev', () => {
    const result = searchInterviews(INTERVIEWS, 'react');
    expect(result.some(i => i.jobPosition === 'React Developer')).toBe(true);
    expect(result.some(i => i.jobPosition === 'Full Stack Dev')).toBe(true);
  });

  test('"python" matches Python Engineer and Data Scientist (jobDesc)', () => {
    const result = searchInterviews(INTERVIEWS, 'python');
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  test('specific exact position match', () => {
    const result = searchInterviews(INTERVIEWS, 'DevOps Engineer');
    expect(result[0].jobPosition).toBe('DevOps Engineer');
  });

  test('no match returns empty', () => {
    expect(searchInterviews(INTERVIEWS, 'xyzfoo123')).toHaveLength(0);
  });

  test('null query returns all', () => {
    expect(searchInterviews(INTERVIEWS, null)).toHaveLength(INTERVIEWS.length);
  });
});

// ── sortInterviewsByDate ─────────────────────────────────────────────────────

describe('sortInterviewsByDate', () => {
  test('desc order: most recent first', () => {
    const sorted = sortInterviewsByDate(INTERVIEWS, 'desc');
    expect(sorted[0].createdAt).toBe('25-05-2025');
  });

  test('asc order: oldest first', () => {
    const sorted = sortInterviewsByDate(INTERVIEWS, 'asc');
    expect(sorted[0].createdAt).toBe('05-05-2025');
  });

  test('does not mutate original array', () => {
    const firstOriginal = INTERVIEWS[0].mockId;
    sortInterviewsByDate(INTERVIEWS, 'desc');
    expect(INTERVIEWS[0].mockId).toBe(firstOriginal);
  });

  test('empty array returns empty', () => {
    expect(sortInterviewsByDate([], 'desc')).toHaveLength(0);
  });
});

// ── paginateInterviews ───────────────────────────────────────────────────────

describe('paginateInterviews', () => {
  test('page 1 returns first 6 items from 7', () => {
    expect(paginateInterviews(INTERVIEWS, 1, 6)).toHaveLength(6);
  });

  test('page 2 returns remaining 1 item from 7', () => {
    expect(paginateInterviews(INTERVIEWS, 2, 6)).toHaveLength(1);
  });

  test('out-of-range page returns empty', () => {
    expect(paginateInterviews(INTERVIEWS, 10, 6)).toHaveLength(0);
  });

  test('perPage=2 returns 2 items from 7 on page 1', () => {
    expect(paginateInterviews(INTERVIEWS, 1, 2)).toHaveLength(2);
  });

  test('first page item matches original first item', () => {
    expect(paginateInterviews(INTERVIEWS, 1, 6)[0].mockId).toBe(INTERVIEWS[0].mockId);
  });
});

// ── getTotalPages ────────────────────────────────────────────────────────────

describe('getTotalPages', () => {
  test('7 items / 6 per page = 2 pages', () => {
    expect(getTotalPages(7, 6)).toBe(2);
  });

  test('6 items / 6 per page = 1 page', () => {
    expect(getTotalPages(6, 6)).toBe(1);
  });

  test('0 items = 1 page (minimum)', () => {
    expect(getTotalPages(0, 6)).toBe(1);
  });

  test('12 items / 6 per page = 2 pages', () => {
    expect(getTotalPages(12, 6)).toBe(2);
  });

  test('13 items / 6 per page = 3 pages', () => {
    expect(getTotalPages(13, 6)).toBe(3);
  });
});

// ── getAvailableTracks ───────────────────────────────────────────────────────

describe('getAvailableTracks', () => {
  test('always includes "All" as first element', () => {
    expect(getAvailableTracks(INTERVIEWS)[0]).toBe('All');
  });

  test('contains Frontend, Backend, DevOps, Full Stack, Data Science', () => {
    const tracks = getAvailableTracks(INTERVIEWS);
    ['Frontend', 'Backend', 'DevOps', 'Full Stack', 'Data Science'].forEach(t => {
      expect(tracks).toContain(t);
    });
  });

  test('no duplicate tracks', () => {
    const tracks = getAvailableTracks(INTERVIEWS);
    const unique = new Set(tracks);
    expect(tracks.length).toBe(unique.size);
  });

  test('empty interviews returns ["All"]', () => {
    expect(getAvailableTracks([])).toEqual(['All']);
  });
});
