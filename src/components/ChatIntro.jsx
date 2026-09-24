import React from "react";
import "./ChatIntro.css";

export default function ChatIntro() {
  return (
    <div className="chat-intro">
      <SoundmarkIcon />
      <h2 className="chat-intro-title">Say hello</h2>
      <p className="chat-intro-body">
        Type or record a message. EAPEN reads the emotion behind it and
        responds with that in mind.
      </p>
    </div>
  );
}

function SoundmarkIcon() {
  return (
    <svg
      className="chat-intro-mark"
      width="112"
      height="112"
      viewBox="0 0 112 112"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="56" cy="56" r="55" stroke="var(--line)" strokeWidth="1" />
      <circle cx="56" cy="56" r="40" stroke="var(--sage-tint)" strokeWidth="1" />
      <rect x="49" y="34" width="14" height="30" rx="7" fill="var(--sage)" />
      <path
        d="M38 54a18 18 0 0 0 36 0M56 72v9M48 81h16"
        stroke="var(--sage)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="30" cy="56" r="3" fill="var(--clay)" />
      <circle cx="82" cy="56" r="3" fill="var(--clay)" />
    </svg>
  );
}
