import React from "react";
import "./Pill.css";

// tone: "neutral" | "sage" | "positive" | "clay"
export default function Pill({ children, tone = "neutral" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}
