// Placeholder content shown when the backend returns nothing (fresh install,
// no history yet) or a request fails. Pages that use this set `isSample`
// so the UI can show a "Sample data" pill instead of pretending it's live.

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const monday = new Date(today);
monday.setDate(today.getDate() - ((today.getDay() + 6) % 7 || 7));

export const SAMPLE_SESSIONS = [
  {
    session_id: "sample-1",
    title: "Exams and feeling stretched",
    started_at: today.toISOString(),
    message_count: 12,
    mood_summary: "sad, then calmer",
    dot: "clay",
  },
  {
    session_id: "sample-2",
    title: "Planning the weekend",
    started_at: yesterday.toISOString(),
    message_count: 8,
    mood_summary: "content",
    dot: "sage",
  },
  {
    session_id: "sample-3",
    title: "Nervous about a group project",
    started_at: monday.toISOString(),
    message_count: 15,
    mood_summary: "anxious, then hopeful",
    dot: "amber",
  },
];

// Roughly mirrors the crossing valence/arousal lines in the mock: mood
// dips then climbs while arousal (intensity) settles.
export const SAMPLE_TREND = [
  { valence: -0.5, arousal: 0.75 },
  { valence: -0.35, arousal: 0.55 },
  { valence: -0.45, arousal: 0.4 },
  { valence: -0.1, arousal: 0.3 },
  { valence: 0.1, arousal: 0.15 },
  { valence: 0.3, arousal: 0.05 },
  { valence: 0.4, arousal: -0.05 },
];

export const SAMPLE_EMOTION_BREAKDOWN = [
  { label: "sad", pct: 31, tone: "tone-clay" },
  { label: "anxious", pct: 22, tone: "tone-amber" },
  { label: "calm", pct: 28, tone: "tone-sage" },
  { label: "hopeful", pct: 19, tone: "tone-mint" },
];

export const SAMPLE_STATS = [
  { title: "Calmer", sub: "Mood after 12 messages" },
  { title: "Sad → steady", sub: "Dominant shift today" },
  { title: "3 of 7", sub: "Days you spoke to someone else too" },
];
