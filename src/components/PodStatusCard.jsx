import React from "react";
import { toneForLabel } from "./emotionTones.js";
import "./PodStatusCard.css";

/**
 * emotion: { label, valence, arousal } for the most recent agent reply,
 * used both to place the marker on the mood bar and to render the reading
 * underneath it. Pass null before the first reply.
 */
export default function PodStatusCard({ emotion }) {
  const valence = typeof emotion?.valence === "number" ? emotion.valence : 0;
  const markerPct = Math.min(100, Math.max(0, ((valence + 1) / 2) * 100));
  const tone = emotion ? toneForLabel(emotion.label) : "tone-neutral";

  return (
    <div className="pod-card">
      <div className="pod-card-top">
        <span className="pod-mic">
          <MicIcon />
          <span className="pod-mic-pulse" />
        </span>
        <div>
          <div className="pod-title">Listening for &ldquo;Hey Eapen&rdquo;</div>
          <div className="pod-subtitle">Current mood read from the last few replies</div>
        </div>
      </div>

      <div className="mood-bar-wrap">
        <div className="mood-bar">
          <span className="mood-marker" style={{ left: `${markerPct}%` }} />
        </div>
        <div className="mood-bar-labels">
          <span>low</span>
          <span>steady</span>
          <span>bright</span>
        </div>
      </div>

      {emotion && (
        <div className="mood-reading">
          <span className={`mood-reading-text ${tone}`}>
            {emotion.label} · valence {formatSigned(emotion.valence)} · arousal{" "}
            {formatSigned(emotion.arousal)}
          </span>
        </div>
      )}
    </div>
  );
}

function formatSigned(v) {
  if (typeof v !== "number") return "—";
  return v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
}

function MicIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19 11a7 7 0 0 1-14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
