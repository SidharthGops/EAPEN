import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useSession } from "../context/SessionContext.jsx";
import { PageHeader, Card, EmptyState } from "../components/Layout.jsx";
import Pill from "../components/Pill.jsx";
import { SAMPLE_SESSIONS } from "../data/sampleData.js";
import "./History.css";

function formatWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (isToday) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export default function History() {
  const { sessionId, setSessionId } = useSession();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);

  useEffect(() => {
    api
      .listSessions()
      .then((data) => {
        if (!data || data.length === 0) {
          setSessions(SAMPLE_SESSIONS);
          setIsSample(true);
        } else {
          setSessions(data);
        }
      })
      .catch(() => {
        setSessions(SAMPLE_SESSIONS);
        setIsSample(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="History"
        subtitle="Every past conversation, one tap away from continuing it."
        action={isSample ? <Pill>Sample data</Pill> : null}
      />

      <div className="history-body">
        {loading && <p className="history-status">Loading sessions…</p>}

        {!loading && sessions.length === 0 && (
          <EmptyState
            title="No conversations yet"
            body="Once you talk with EAPEN, every session will show up here with its dominant emotion."
          />
        )}

        <div className="history-list">
          {sessions.map((s) => (
            <Card key={s.session_id} className="history-item">
              <div className="history-item-left">
                <span className={`history-dot dot-${s.dot || "sage"}`} />
                <div>
                  <div className="history-item-title">{s.title}</div>
                  <div className="history-item-date">
                    {formatWhen(s.started_at)} · {s.message_count} messages · {s.mood_summary}
                  </div>
                </div>
              </div>
              <button
                className="history-open"
                onClick={() => setSessionId(s.session_id)}
                disabled={s.session_id === sessionId}
              >
                {s.session_id === sessionId ? "Active" : "Reopen"}
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
