import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useSession } from "../context/SessionContext.jsx";
import { PageHeader, Card, EmptyState } from "../components/Layout.jsx";
import EmotionBadge from "../components/EmotionBadge.jsx";
import "./History.css";

export default function History() {
  const { sessionId, setSessionId } = useSession();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listSessions()
      .then(setSessions)
      .catch(() => setError("Couldn't load sessions from the backend."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="History" subtitle="Every past conversation, one tap away from continuing it." />

      <div className="history-body">
        {loading && <p className="history-status">Loading sessions…</p>}
        {error && <p className="history-status">{error}</p>}

        {!loading && !error && sessions.length === 0 && (
          <EmptyState
            title="No conversations yet"
            body="Once you talk with EAPEN, every session will show up here with its dominant emotion."
          />
        )}

        <div className="history-list">
          {sessions.map((s) => (
            <Card key={s.session_id} className="history-item">
              <div>
                <div className="history-item-title">
                  {s.title || `Session ${s.session_id.slice(0, 8)}`}
                </div>
                <div className="history-item-date">
                  {s.started_at ? new Date(s.started_at).toLocaleString() : ""}
                </div>
              </div>
              <div className="history-item-right">
                {s.last_emotion && <EmotionBadge emotion={s.last_emotion} />}
                <button
                  className="history-open"
                  onClick={() => setSessionId(s.session_id)}
                  disabled={s.session_id === sessionId}
                >
                  {s.session_id === sessionId ? "Active" : "Open"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
