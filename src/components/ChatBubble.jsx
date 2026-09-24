import React, { useState } from "react";
import EmotionBadge from "./EmotionBadge.jsx";
import "./ChatBubble.css";

const STYLE_WORD = { warm: "gentle", steady: "steady", direct: "direct" };

export default function ChatBubble({ role, text, emotion, crisisFlag, persona, time }) {
  const isUser = role === "user";
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className={`bubble-row ${isUser ? "is-user" : "is-agent"}`}>
      <div className="bubble-col">
        {!isUser && persona && (
          <div className="bubble-tag">
            {STYLE_WORD[persona] || "gentle"} · {persona}
          </div>
        )}

        <div className={`bubble ${isUser ? "bubble-user" : "bubble-agent"}`}>
          {crisisFlag && (
            <div className="bubble-crisis-note">
              Support resources were offered in this reply.
            </div>
          )}
          <p className="bubble-text">{text}</p>
          {emotion && (
            <div className="bubble-meta">
              <EmotionBadge emotion={emotion} />
            </div>
          )}
        </div>

        {!isUser && (
          <div className="bubble-footer">
            Spoken by the pod
            {time && <> · {time}</>}
            {" · "}
            <button
              type="button"
              className="bubble-support-link"
              onClick={() => setShowSupport((v) => !v)}
            >
              Need support now?
            </button>
          </div>
        )}

        {!isUser && showSupport && (
          <div className="bubble-support-panel">
            If things feel like too much right now, it can help to reach out
            to someone directly — a crisis line in your area, or a person you
            trust nearby.
          </div>
        )}
      </div>
    </div>
  );
}
