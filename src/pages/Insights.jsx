import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useSession } from "../context/SessionContext.jsx";
import { PageHeader, Card, EmptyState } from "../components/Layout.jsx";
import Pill from "../components/Pill.jsx";
import TrendChart from "../components/TrendChart.jsx";
import "../components/TrendChart.css";
import {
  SAMPLE_TREND,
  SAMPLE_EMOTION_BREAKDOWN,
  SAMPLE_STATS,
} from "../data/sampleData.js";
import "./Insights.css";

export default function Insights() {
  const { sessionId } = useSession();
  const [trend, setTrend] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setTrend(SAMPLE_TREND);
      setBreakdown(SAMPLE_EMOTION_BREAKDOWN);
      setStats(SAMPLE_STATS);
      setIsSample(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getEmotionTrend(sessionId)
      .then((data) => {
        if (!data || data.length < 2) {
          setTrend(SAMPLE_TREND);
          setBreakdown(SAMPLE_EMOTION_BREAKDOWN);
          setStats(SAMPLE_STATS);
          setIsSample(true);
        } else {
          setTrend(data);
          setIsSample(false);
          // TODO: once the backend exposes an emotion-breakdown + summary-stats
          // endpoint, load those here instead of falling back to samples.
          setBreakdown(SAMPLE_EMOTION_BREAKDOWN);
          setStats(SAMPLE_STATS);
        }
      })
      .catch(() => {
        setTrend(SAMPLE_TREND);
        setBreakdown(SAMPLE_EMOTION_BREAKDOWN);
        setStats(SAMPLE_STATS);
        setIsSample(true);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div>
      <PageHeader
        title="Insights"
        subtitle="How the conversation's emotional tone shifts over time."
        action={isSample ? <Pill>Sample data</Pill> : null}
      />

      <div className="insights-body">
        {loading && <p className="history-status">Loading trend…</p>}

        {!loading && trend.length < 2 && (
          <EmptyState title="Not enough data yet" body="Keep the conversation going — insights fill in after a few exchanges." />
        )}

        {!loading && trend.length >= 2 && (
          <>
            <div className="stat-row">
              {stats.map((s, i) => (
                <Card key={i} className="stat-card">
                  <div className="stat-title">{s.title}</div>
                  <div className="stat-sub">{s.sub}</div>
                </Card>
              ))}
            </div>

            <div className="insights-grid">
              <Card>
                <div className="insights-card-label">Valence and arousal</div>
                <TrendChart
                  series={[
                    { points: trend.map((t) => t.valence), color: "var(--sage)", name: "valence" },
                    { points: trend.map((t) => t.arousal), color: "var(--amber)", name: "arousal" },
                  ]}
                />
              </Card>

              <Card>
                <div className="insights-card-label">Emotions in this session</div>
                <div className="emotion-bars">
                  {breakdown.map((e) => (
                    <div className="emotion-bar-row" key={e.label}>
                      <span className="emotion-bar-label">{e.label}</span>
                      <span className="emotion-bar-track">
                        <span className={`emotion-bar-fill ${e.tone}`} style={{ width: `${e.pct}%` }} />
                      </span>
                      <span className="emotion-bar-pct">{e.pct}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
