import React from "react";

/**
 * Minimal dependency-free multi-line chart for numeric series in [-1, 1]
 * (valence, arousal, ...). Renders as inline SVG — no chart library needed.
 *
 * series: [{ points: number[], color: string, name: string }]
 */
export default function TrendChart({ series, height = 170 }) {
  const width = 600;
  const padding = 20;

  const longest = Math.max(...series.map((s) => s.points.length), 0);
  if (longest < 2) {
    return (
      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
        Not enough data yet to plot a trend.
      </div>
    );
  }

  const xStep = (width - padding * 2) / (longest - 1);
  const toY = (v) => height - padding - ((v + 1) / 2) * (height - padding * 2);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Emotion trend">
        <line
          x1={padding}
          x2={width - padding}
          y1={toY(0)}
          y2={toY(0)}
          stroke="var(--line)"
          strokeDasharray="4 4"
        />
        {series.map((s, si) => {
          const path = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${padding + i * xStep} ${toY(p)}`)
            .join(" ");
          return (
            <g key={si}>
              <path d={path} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {s.points.map((p, i) => (
                <circle key={i} cx={padding + i * xStep} cy={toY(p)} r="2.5" fill={s.color} />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="trend-legend">
        {series.map((s, i) => (
          <span className="trend-legend-item" key={i}>
            <span className="trend-legend-dot" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
