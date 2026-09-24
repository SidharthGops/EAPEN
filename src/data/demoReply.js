// Keyword-based stand-in for the backend's emotion detection + reply
// generation, used only while there's no FastAPI server to talk to.
// Deliberately simple — this exists so the UI is testable end to end
// before the real speech/text emotion models and LLM are wired up.

const CRISIS_WORDS = [
  "suicide",
  "kill myself",
  "end it all",
  "want to die",
  "not want to be here",
];

const CATEGORIES = [
  {
    label: "anxious",
    tone: "tone-amber",
    valence: -0.3,
    arousal: 0.7,
    words: ["anxious", "nervous", "worried", "scared", "panic"],
  },
  {
    label: "sad",
    tone: "tone-clay",
    valence: -0.4,
    arousal: 0.3,
    words: ["sad", "tired", "stressed", "exhausted", "down", "upset", "stretched", "overwhelmed"],
  },
  {
    label: "hopeful",
    tone: "tone-mint",
    valence: 0.5,
    arousal: 0.3,
    words: ["hopeful", "excited", "glad", "relieved", "looking forward"],
  },
  {
    label: "calm",
    tone: "tone-sage",
    valence: 0.3,
    arousal: -0.3,
    words: ["calm", "fine", "okay", "relaxed", "content", "good"],
  },
];

const REPLIES = {
  warm: {
    anxious: "It makes sense to feel nervous about that. What's the part that's weighing on you most?",
    sad: "That sounds heavy. Want to talk it through, or would a short breathing break help first?",
    hopeful: "That's lovely to hear — tell me more about what's going well.",
    calm: "Good to hear you're feeling steady. Anything on your mind either way?",
    neutral: "I'm here and listening — go on.",
  },
  steady: {
    anxious: "Okay. Let's name what's making this feel uncertain.",
    sad: "Noted. Let's take this one piece at a time — what's the most pressing part?",
    hopeful: "Good. What's next on your list?",
    calm: "Alright — steady as she goes.",
    neutral: "Go ahead, I'm listening.",
  },
  direct: {
    anxious: "What's the actual risk here, concretely?",
    sad: "That's rough. Do you need to vent, or to problem-solve?",
    hopeful: "Nice. What's the next step?",
    calm: "Good. Anything you need from me?",
    neutral: "Go on.",
  },
};

export function generateDemoReply(personaId, userText) {
  const lower = userText.toLowerCase();

  if (CRISIS_WORDS.some((w) => lower.includes(w))) {
    return {
      reply:
        "I'm really glad you told me. If you're in immediate danger, please contact your local emergency number or a crisis line right now. I'm still here too — do you want to tell me more?",
      emotion: { label: "distress", valence: -0.8, arousal: 0.6, confidence: 0.5 },
      crisis_flag: true,
    };
  }

  const match = CATEGORIES.find((c) => c.words.some((w) => lower.includes(w)));
  const label = match?.label || "neutral";
  const persona = REPLIES[personaId] ? personaId : "warm";

  return {
    reply: REPLIES[persona][label],
    emotion: {
      label,
      valence: match?.valence ?? 0,
      arousal: match?.arousal ?? 0,
      confidence: match ? 0.55 : 0.3,
    },
    crisis_flag: false,
  };
}
