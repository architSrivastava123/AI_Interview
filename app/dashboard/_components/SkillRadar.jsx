"use client";

/**
 * SkillRadar.jsx
 * SVG-based radar/spider chart for multi-dimensional score visualization.
 * Zero external dependencies.
 */
import React, { useMemo } from 'react';

const DEFAULT_SIZE = 260;
const COLORS = {
  Technical:     { fill: 'rgba(99,102,241,0.25)', stroke: '#818cf8' },
  Fluency:       { fill: 'rgba(168,85,247,0.25)',  stroke: '#c084fc' },
  Pace:          { fill: 'rgba(34,211,238,0.25)',  stroke: '#22d3ee' },
  Confidence:    { fill: 'rgba(249,115,22,0.25)',  stroke: '#fb923c' },
  Communication: { fill: 'rgba(52,211,153,0.25)',  stroke: '#34d399' },
};
const FILL_COLOR = 'rgba(99,102,241,0.18)';
const STROKE_COLOR = '#818cf8';

/**
 * @param {{ data: Array<{axis: string, value: number, label: string}>, size?: number }} props
 */
export function SkillRadar({ data = [], size = DEFAULT_SIZE }) {
  const { polygonPoints, axisLines, labels, gridPolygons } = useMemo(() => {
    if (!data || data.length === 0) return { polygonPoints: '', axisLines: [], labels: [], gridPolygons: [] };

    const n = data.length;
    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) * 0.72;

    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2;

    const toXY = (i, radius) => ({
      x: cx + radius * Math.cos(startAngle + i * angleStep),
      y: cy + radius * Math.sin(startAngle + i * angleStep),
    });

    // Grid polygons at 25%, 50%, 75%, 100% of radius
    const grids = [0.25, 0.5, 0.75, 1].map(scale => {
      const pts = Array.from({ length: n }, (_, i) => toXY(i, r * scale));
      return pts.map(p => `${p.x},${p.y}`).join(' ');
    });

    // Axis lines
    const axes = Array.from({ length: n }, (_, i) => {
      const outer = toXY(i, r);
      return { x1: cx, y1: cy, x2: outer.x, y2: outer.y };
    });

    // Data polygon
    const dataPoints = data.map((d, i) => {
      const val = Math.max(0, Math.min(100, Number(d.value) || 0));
      const scaled = (val / 100) * r;
      return toXY(i, scaled);
    });
    const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    // Labels (offset outward)
    const lbls = data.map((d, i) => {
      const outer = toXY(i, r * 1.18);
      const angle = startAngle + i * angleStep;
      const anchorX = cx + r * 1.24 * Math.cos(angle);
      return {
        x: outer.x,
        y: outer.y,
        label: d.label || d.axis,
        value: d.value,
        anchor: anchorX < cx - 5 ? 'end' : anchorX > cx + 5 ? 'start' : 'middle',
      };
    });

    return { polygonPoints: polygon, axisLines: axes, labels: lbls, gridPolygons: grids };
  }, [data, size]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-gray-600 text-sm">
        No score data
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-label="Skill radar chart"
      role="img"
      className="mx-auto"
    >
      <defs>
        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.05)" />
        </radialGradient>
      </defs>

      {/* Grid polygons */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((ax, i) => (
        <line
          key={i}
          x1={ax.x1} y1={ax.y1} x2={ax.x2} y2={ax.y2}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="url(#radarGrad)"
        stroke={STROKE_COLOR}
        strokeWidth={2}
        strokeLinejoin="round"
        opacity={0.9}
      />

      {/* Data point dots */}
      {data.map((d, i) => {
        const angle = -Math.PI / 2 + i * ((2 * Math.PI) / data.length);
        const r = (size / 2) * 0.72;
        const val = Math.max(0, Math.min(100, Number(d.value) || 0));
        const scaled = (val / 100) * r;
        const cx = size / 2 + scaled * Math.cos(angle);
        const cy = size / 2 + scaled * Math.sin(angle);
        return (
          <circle key={i} cx={cx} cy={cy} r={3.5}
            fill={STROKE_COLOR}
            stroke="rgba(129,140,248,0.4)" strokeWidth={5}
          />
        );
      })}

      {/* Labels */}
      {labels.map((l, i) => (
        <g key={i}>
          <text
            x={l.x} y={l.y - 2}
            textAnchor={l.anchor}
            fontSize={10}
            fontWeight={700}
            fill="rgba(203,213,225,0.9)"
            className="uppercase tracking-wider"
          >
            {l.label}
          </text>
          <text
            x={l.x} y={l.y + 11}
            textAnchor={l.anchor}
            fontSize={11}
            fontWeight={900}
            fill="#818cf8"
          >
            {l.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default SkillRadar;
