import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useSession } from "../context/SessionContext.jsx";
import { PageHeader, Card, EmptyState } from "../components/Layout.jsx";
import TrendChart from "../components/TrendChart.jsx";
import "./Insights.css";

export default function Insights() {
  const { sessionId } = useSession();
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    api
      .getEmotionTrend(sessionId)
      .then(setTrend)
      .catch(() => setTrend([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div>
        <PageHeader title="Insights" subtitle="How the conversation's emotional tone shifts over time." />
        <div className="insights-body">
          <EmptyState title="No active session" body="Start a chat first, then come back here to see the trend." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Insights" subtitle="How this conversation's emotional tone shifts over time." />
      <div className="insights-body">
        {loading && <p className="history-status">Loading trend…</p>}

        {!loading && trend.length < 2 && (
          <EmptyState title="Not enough data yet" body="Keep the conversation going — insights fill in after a few exchanges." />
        )}

        {!loading && trend.length >= 2 && (
          <div className="insights-grid">
            <Card>
              <div className="insights-card-label">Valence — how positive or negative</div>
              <TrendChart points={trend.map((t) => t.valence)} label="valence" color="var(--sage)" />
            </Card>
            <Card>
              <div className="insights-card-label">Arousal — how calm or intense</div>
              <TrendChart points={trend.map((t) => t.arousal)} label="arousal" color="var(--clay)" />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
