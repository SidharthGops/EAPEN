import React from "react";
import EmotionBadge from "./EmotionBadge.jsx";
import "./ChatBubble.css";

export default function ChatBubble({ role, text, emotion, crisisFlag }) {
  const isUser = role === "user";

  return (
    <div className={`bubble-row ${isUser ? "is-user" : "is-agent"}`}>
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
    </div>
  );
}
