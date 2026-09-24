// Maps a discrete emotion label to a quiet, low-saturation tone class.
// Shared by EmotionBadge, the pod mood tag, and the Insights emotion bars
// so the same feeling always reads as the same color everywhere.
export const TONE_BY_LABEL = {
  joy: "tone-warm",
  hopeful: "tone-mint",
  calm: "tone-sage",
  content: "tone-sage",
  steady: "tone-sage",
  neutral: "tone-neutral",
  sadness: "tone-clay",
  sad: "tone-clay",
  anger: "tone-clay",
  fear: "tone-clay",
  anxious: "tone-amber",
  distress: "tone-clay",
  surprise: "tone-warm",
};

export function toneForLabel(label) {
  return TONE_BY_LABEL[label?.toLowerCase()] || "tone-neutral";
}
