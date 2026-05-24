"use client";

/**
 * AnalyticsChart.jsx
 * SVG-based line chart for performance trend visualization.
 * Zero external chart library dependencies.
 */
import React, { useMemo } from 'react';

const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 16, bottom: 40, left: 44 };

export function AnalyticsChart({ data = [], width = 600, height = CHART_HEIGHT }) {
  const innerWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;

  const { points, pathD, gridLines, xLabels, yLabels } = useMemo(() => {
    if (!data || data.length === 0) return { points: [], pathD: '', gridLines: [], xLabels: [], yLabels: [] };

    const scores = data.map(d => Number(d.score) || 0);
    const maxScore = Math.max(...scores, 100);
    const minScore = Math.max(0, Math.min(...scores) - 10);
    const range = maxScore - minScore || 1;

    const toX = (i) => (i / Math.max(data.length - 1, 1)) * innerWidth;
    const toY = (s) => innerHeight - ((s - minScore) / range) * innerHeight;

    const pts = data.map((d, i) => ({
      x: toX(i),
      y: toY(Number(d.score) || 0),
      score: d.score,
      date: d.date,
      grade: d.grade,
      track: d.track,
    }));

    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Y-axis grid lines at 25% intervals
    const gridCount = 4;
    const grids = Array.from({ length: gridCount + 1 }, (_, i) => {
      const val = minScore + (range * i) / gridCount;
      return { y: toY(val), label: Math.round(val) };
    });

    // X-axis labels (show max 6)
    const step = Math.max(1, Math.floor(data.length / 6));
    const xLbls = data
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map((d, idx) => ({
        x: toX(data.indexOf(d)),
        label: d.date ? d.date.slice(0, 5) : `S${idx + 1}`,
      }));

    return { points: pts, pathD: d, gridLines: grids, xLabels: xLbls, yLabels: grids };
  }, [data, innerWidth, innerHeight]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-600 text-sm">
        No session data yet
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minWidth: 280 }}
        aria-label="Performance trend chart"
        role="img"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.01" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g transform={`translate(${CHART_PADDING.left}, ${CHART_PADDING.top})`}>
          {/* Grid lines */}
          {gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={0} y1={g.y} x2={innerWidth} y2={g.y}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1}
              />
              <text
                x={-8} y={g.y + 4}
                textAnchor="end" fontSize={10}
                fill="rgba(148,163,184,0.7)"
              >
                {g.label}
              </text>
            </g>
          ))}

          {/* Area fill */}
          {points.length > 1 && (
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${innerHeight} L ${points[0].x} ${innerHeight} Z`}
              fill="url(#areaGradient)"
            />
          )}

          {/* Trend line */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#glow)"
            />
          )}

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y} r={4}
                fill="#818cf8"
                stroke="rgba(129,140,248,0.3)"
                strokeWidth={6}
                className="cursor-pointer"
              />
              <title>{`Score: ${p.score} | Grade: ${p.grade} | ${p.date}`}</title>
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels.map((l, i) => (
            <text
              key={i}
              x={l.x} y={innerHeight + 22}
              textAnchor="middle" fontSize={10}
              fill="rgba(148,163,184,0.7)"
            >
              {l.label}
            </text>
          ))}

          {/* Axes */}
          <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        </g>
      </svg>
    </div>
  );
}

export default AnalyticsChart;
