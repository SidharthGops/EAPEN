import React from "react";

/**
 * Minimal dependency-free line chart for a single numeric series in [-1, 1]
 * (valence or arousal). Renders as inline SVG.
 */
export default function TrendChart({ points, label, color = "var(--sage)" }) {
  const width = 640;
  const height = 160;
  const padding = 20;

  if (!points || points.length < 2) {
    return (
      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
        Not enough data yet to plot {label}.
      </div>
    );
  }

  const xStep = (width - padding * 2) / (points.length - 1);
  const toY = (v) => height - padding - ((v + 1) / 2) * (height - padding * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${padding + i * xStep} ${toY(p)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={label}>
      <line
        x1={padding}
        x2={width - padding}
        y1={toY(0)}
        y2={toY(0)}
        stroke="var(--line)"
        strokeDasharray="4 4"
      />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={padding + i * xStep} cy={toY(p)} r="2.5" fill={color} />
      ))}
    </svg>
  );
}
