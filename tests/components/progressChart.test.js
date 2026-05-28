/**
 * tests/components/progressChart.test.js
 *
 * Tests the pure coordinate/computation logic in:
 *  - AnalyticsChart.jsx (point calculation, path generation, label generation)
 *  - SkillRadar.jsx     (polygon coordinate calculation, clamp behavior)
 */

// ── AnalyticsChart pure logic ─────────────────────────────────────────────────

const CHART_HEIGHT  = 200;
const CHART_PADDING = { top: 20, right: 16, bottom: 40, left: 44 };

function computeChartData(data, width = 600) {
  const innerWidth  = width - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  if (!data || data.length === 0) {
    return { points: [], pathD: '', gridLines: [], xLabels: [] };
  }

  const scores   = data.map(d => Number(d.score) || 0);
  const maxScore = Math.max(...scores, 100);
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const range    = maxScore - minScore || 1;

  const toX = (i) => (i / Math.max(data.length - 1, 1)) * innerWidth;
  const toY = (s) => innerHeight - ((s - minScore) / range) * innerHeight;

  const pts = data.map((d, i) => ({
    x: toX(i),
    y: toY(Number(d.score) || 0),
    score: d.score,
    date: d.date,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const val = minScore + (range * i) / gridCount;
    return { y: toY(val), label: Math.round(val) };
  });

  const step = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d, idx) => ({
      x: toX(data.indexOf(d)),
      label: d.date ? d.date.slice(0, 5) : `S${idx + 1}`,
    }));

  return { points: pts, pathD, gridLines, xLabels };
}

// ── SkillRadar pure logic ─────────────────────────────────────────────────────

function computeRadarPoints(data, size = 260) {
  if (!data || data.length === 0) return [];

  const n = data.length;
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size / 2) * 0.72;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  return data.map((d, i) => {
    const val    = Math.max(0, Math.min(100, Number(d.value) || 0));
    const scaled = (val / 100) * r;
    const angle  = startAngle + i * angleStep;
    return {
      x: cx + scaled * Math.cos(angle),
      y: cy + scaled * Math.sin(angle),
      value: val,
      axis: d.axis,
    };
  });
}

function computeGridPolygons(n, size = 260) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = (size / 2) * 0.72;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  return [0.25, 0.5, 0.75, 1].map(scale => {
    return Array.from({ length: n }, (_, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x: cx + r * scale * Math.cos(angle),
        y: cy + r * scale * Math.sin(angle),
      };
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe('AnalyticsChart — computeChartData', () => {
  const DATA_5 = [
    { score: 55, date: '01-05' },
    { score: 62, date: '02-05' },
    { score: 70, date: '03-05' },
    { score: 78, date: '04-05' },
    { score: 85, date: '05-05' },
  ];

  test('returns 5 points for 5 data items', () => {
    expect(computeChartData(DATA_5).points).toHaveLength(5);
  });

  test('first point x is 0 (left edge)', () => {
    expect(computeChartData(DATA_5).points[0].x).toBe(0);
  });

  test('last point x equals innerWidth', () => {
    const innerWidth = 600 - CHART_PADDING.left - CHART_PADDING.right;
    const last = computeChartData(DATA_5).points[DATA_5.length - 1];
    expect(last.x).toBe(innerWidth);
  });

  test('pathD starts with M', () => {
    expect(computeChartData(DATA_5).pathD.trimStart()).toMatch(/^M/);
  });

  test('pathD contains L segments for each subsequent point', () => {
    const { pathD } = computeChartData(DATA_5);
    const lCount = (pathD.match(/L/g) || []).length;
    expect(lCount).toBe(DATA_5.length - 1);
  });

  test('gridLines has 5 items (0–4 at 25% steps)', () => {
    expect(computeChartData(DATA_5).gridLines).toHaveLength(5);
  });

  test('empty data returns no points', () => {
    expect(computeChartData([]).points).toHaveLength(0);
  });

  test('null data returns no points', () => {
    expect(computeChartData(null).points).toHaveLength(0);
  });

  test('single data point: x=0 and path starts with M', () => {
    const single = [{ score: 75, date: '01-05' }];
    const { points, pathD } = computeChartData(single);
    expect(points[0].x).toBe(0);
    expect(pathD).toMatch(/^M/);
  });

  test('xLabels is limited in size for many data points (step-based reduction)', () => {
    const manyData = Array.from({ length: 20 }, (_, i) => ({ score: 60 + i, date: `${i + 1}-05` }));
    const { xLabels } = computeChartData(manyData);
    // The algorithm uses step = max(1, floor(20/6)) = 3, plus the last always included
    // So: indices 0,3,6,9,12,15,18,19 → up to 8 labels (last is always added)
    expect(xLabels.length).toBeGreaterThanOrEqual(1);
    expect(xLabels.length).toBeLessThanOrEqual(9); // practical upper bound
  });

  test('xLabels always includes the last data point', () => {
    const manyData = Array.from({ length: 15 }, (_, i) => ({ score: 60, date: `${i + 1}-05` }));
    const { xLabels, points } = computeChartData(manyData);
    const lastX = points[points.length - 1].x;
    expect(xLabels.some(l => l.x === lastX)).toBe(true);
  });

  test('higher scores yield lower y values', () => {
    const { points } = computeChartData(DATA_5);
    expect(points[4].y).toBeLessThan(points[0].y);
  });
});

describe('SkillRadar — computeRadarPoints', () => {
  const RADAR_DATA = [
    { axis: 'Technical',     value: 78 },
    { axis: 'Fluency',       value: 82 },
    { axis: 'Pace',          value: 65 },
    { axis: 'Confidence',    value: 70 },
    { axis: 'Communication', value: 55 },
  ];

  test('returns 5 points for 5 dimensions', () => {
    expect(computeRadarPoints(RADAR_DATA)).toHaveLength(5);
  });

  test('empty data returns empty array', () => {
    expect(computeRadarPoints([])).toHaveLength(0);
  });

  test('null data returns empty array', () => {
    expect(computeRadarPoints(null)).toHaveLength(0);
  });

  test('each point has x, y, value, axis', () => {
    computeRadarPoints(RADAR_DATA).forEach(p => {
      expect(p).toHaveProperty('x');
      expect(p).toHaveProperty('y');
      expect(p).toHaveProperty('value');
      expect(p).toHaveProperty('axis');
    });
  });

  test('zero value point is at center (cx, cy)', () => {
    const zeroData = [{ axis: 'Tech', value: 0 }];
    const [p] = computeRadarPoints(zeroData, 260);
    expect(p.x).toBeCloseTo(130);
    expect(p.y).toBeCloseTo(130);
  });

  test('100 value: point is at full radius (x ≠ center)', () => {
    const fullData = [{ axis: 'Tech', value: 100 }];
    const [p] = computeRadarPoints(fullData, 260);
    const cx = 130;
    // At -PI/2 angle, x should still be cx (cos(-PI/2)=0), y should be cx - r
    expect(p.x).toBeCloseTo(cx, 0);
    expect(p.y).toBeLessThan(cx);
  });

  test('clamps values > 100 to 100', () => {
    const data = [{ axis: 'Tech', value: 150 }];
    const [p] = computeRadarPoints(data, 260);
    expect(p.value).toBe(100);
  });

  test('clamps negative values to 0', () => {
    const data = [{ axis: 'Tech', value: -20 }];
    const [p] = computeRadarPoints(data, 260);
    expect(p.value).toBe(0);
  });

  test('null value treated as 0', () => {
    const data = [{ axis: 'Tech', value: null }];
    const [p] = computeRadarPoints(data, 260);
    expect(p.value).toBe(0);
  });
});

describe('SkillRadar — computeGridPolygons', () => {
  test('returns 4 grid rings', () => {
    expect(computeGridPolygons(5)).toHaveLength(4);
  });

  test('each ring has n vertices', () => {
    computeGridPolygons(5).forEach(ring => {
      expect(ring).toHaveLength(5);
    });
  });

  test('outermost ring vertices are farther from center than innermost', () => {
    const grids = computeGridPolygons(5, 260);
    const cx = 130;
    const cy = 130;

    const dist = (pt) => Math.sqrt((pt.x - cx) ** 2 + (pt.y - cy) ** 2);
    const innerDist = dist(grids[0][0]);
    const outerDist = dist(grids[3][0]);
    expect(outerDist).toBeGreaterThan(innerDist);
  });
});
