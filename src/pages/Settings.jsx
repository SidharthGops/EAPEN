import React, { useState } from "react";
import { useSession } from "../context/SessionContext.jsx";
import { PageHeader, Card } from "../components/Layout.jsx";
import "./Settings.css";

const PERSONAS = [
  { id: "warm", name: "Warm", blurb: "Gentle, encouraging, checks in often." },
  { id: "steady", name: "Steady", blurb: "Calm and even, low on small talk." },
  { id: "direct", name: "Direct", blurb: "Concise, practical, gets to the point." },
];

export default function Settings() {
  const { sessionId, setSessionId } = useSession();
  const [persona, setPersona] = useState(
    () => localStorage.getItem("eapen.persona") || "warm"
  );

  const choosePersona = (id) => {
    setPersona(id);
    localStorage.setItem("eapen.persona", id);
    // TODO: once the backend exposes PATCH /api/sessions/{id}, send the
    // persona choice there so the TTS + response style actually change.
  };

  const startNewSession = () => {
    setSessionId(null);
    localStorage.removeItem("eapen.session_id");
    window.location.href = "/";
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Persona, session, and connection details." />
      <div className="settings-body">
        <Card className="settings-section">
          <h3 className="settings-heading">Persona</h3>
          <p className="settings-copy">Sets the tone EAPEN's replies and voice output use.</p>
          <div className="persona-grid">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                className={`persona-option ${persona === p.id ? "is-selected" : ""}`}
                onClick={() => choosePersona(p.id)}
              >
                <div className="persona-name">{p.name}</div>
                <div className="persona-blurb">{p.blurb}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="settings-section">
          <h3 className="settings-heading">Session</h3>
          <p className="settings-copy">
            Current session: <code>{sessionId || "none"}</code>
          </p>
          <button className="settings-danger" onClick={startNewSession}>
            Start a new session
          </button>
        </Card>

        <Card className="settings-section">
          <h3 className="settings-heading">Connection</h3>
          <p className="settings-copy">
            API base URL:{" "}
            <code>{import.meta.env.VITE_API_BASE_URL || "same origin (dev proxy to :8000)"}</code>
          </p>
          <p className="settings-hint">
            Set <code>VITE_API_BASE_URL</code> in a <code>.env</code> file to point at a deployed
            FastAPI backend.
          </p>
        </Card>
      </div>
    </div>
  );
}
