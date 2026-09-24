import React, { useState } from "react";
import { useSession, PERSONAS } from "../context/SessionContext.jsx";
import { PageHeader, Card } from "../components/Layout.jsx";
import Pill from "../components/Pill.jsx";
import Toggle from "../components/Toggle.jsx";
import "./Settings.css";

export default function Settings() {
  const { sessionId, setSessionId, persona, setPersona, personaInfo } = useSession();
  const [muteMic, setMuteMic] = useState(
    () => localStorage.getItem("eapen.mute_mic") === "true"
  );
  const [ledRing, setLedRing] = useState(
    () => localStorage.getItem("eapen.led_ring") !== "false"
  );

  const toggleMute = (v) => {
    setMuteMic(v);
    localStorage.setItem("eapen.mute_mic", String(v));
    // TODO: once the pod exposes a control channel, send this there too.
  };

  const toggleLed = (v) => {
    setLedRing(v);
    localStorage.setItem("eapen.led_ring", String(v));
  };

  const startNewSession = () => {
    setSessionId(null);
    window.location.href = "/";
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Persona, pod, session and connection details." />
      <div className="settings-body">
        <Card className="settings-section">
          <h3 className="settings-heading">Persona</h3>
          <div className="persona-grid">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                className={`persona-option ${persona === p.id ? "is-selected" : ""}`}
                onClick={() => setPersona(p.id)}
              >
                <div className="persona-name">{p.name}</div>
                <div className="persona-blurb">{p.blurb}</div>
              </button>
            ))}
          </div>
        </Card>

        <div className="settings-row">
          <Card className="settings-section">
            <h3 className="settings-heading">Pod</h3>

            <div className="settings-item">
              <div>
                <div className="settings-item-label">Mute microphone</div>
                <div className="settings-item-caption">Same as the switch on the pod</div>
              </div>
              <Toggle checked={muteMic} onChange={toggleMute} label="Mute microphone" />
            </div>

            <div className="settings-item">
              <div>
                <div className="settings-item-label">Wake word</div>
                <div className="settings-item-caption">&ldquo;Hey Eapen&rdquo;, detected on-device</div>
              </div>
              <Pill>On-device</Pill>
            </div>

            <div className="settings-item">
              <div>
                <div className="settings-item-label">LED ring</div>
                <div className="settings-item-caption">Shows listening and mood colour</div>
              </div>
              <Toggle checked={ledRing} onChange={toggleLed} label="LED ring" />
            </div>
          </Card>

          <Card className="settings-section">
            <h3 className="settings-heading">Session and connection</h3>

            <div className="settings-item">
              <div>
                <div className="settings-item-label">Current session</div>
                <div className="settings-item-caption">
                  {sessionId ? `Session ${sessionId.slice(0, 8)}` : "none yet"}
                </div>
              </div>
              <button className="settings-danger" onClick={startNewSession}>
                New session
              </button>
            </div>

            <div className="settings-item">
              <div>
                <div className="settings-item-label">Backend</div>
                <div className="settings-item-caption">
                  {import.meta.env.VITE_API_BASE_URL || "same origin · dev proxy to :8000"}
                </div>
              </div>
              <Pill tone="positive">Connected</Pill>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
