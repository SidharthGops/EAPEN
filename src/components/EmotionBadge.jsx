import React from "react";
import "./EmotionBadge.css";
import { toneForLabel } from "./emotionTones.js";

export default function EmotionBadge({ emotion }) {
  if (!emotion) return null;
  const { label = "neutral", confidence, modality_agreement } = emotion;
  const tone = toneForLabel(label);

  return (
    <span className={`emotion-badge ${tone}`} title="Detected emotional state">
      <span className="emotion-dot" />
      {label}
      {typeof confidence === "number" && (
        <span className="emotion-confidence">{Math.round(confidence * 100)}%</span>
      )}
      {modality_agreement === false && (
        <span className="emotion-flag" title="Speech and text signals disagreed">
          ⚠
        </span>
      )}
    </span>
  );
}
