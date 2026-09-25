"""Deterministic crisis check. Not LLM-dependent: keyword rules + emotion severity threshold."""
import re

HARD = [
    r"\bbetter off (without me|if i (didn'?t|did not) exist|if i was gone|if i were gone)\b",
    r"\bpeople (would be|are) better off\b",
    r"\bworld (would be|is) better off without me\b",
    r"\bkill myself\b",
    r"\bsuicid",
    r"\bend my life\b",
    r"\bwant to die\b",
    r"\bdon'?t want to (live|be alive)\b",
    r"\bhurt myself\b",
    r"\bself[- ]?harm\b",
]
SOFT = [
    r"\bno (point|reason) (in|to) (living|going on|go on)\b",
    r"\bcan'?t (go on|do this anymore)\b",
    r"\bgive up on (life|everything)\b",
    r"\bhopeless\b",
    r"\bnobody would (care|miss me)\b",
]

CRISIS_REPLY = (
    "I'm really glad you told me this, and I'm concerned about you. "
    "You don't have to carry this alone. Please reach out to someone right now: "
    "in India you can call Tele-MANAS at 14416 (free, 24x7), or 112 if you're in immediate danger. "
    "If there's someone nearby you trust, please tell them how you're feeling. "
    "I'm here and listening too."
)


def is_crisis(text: str, emo: dict) -> bool:
    t = text.lower()
    if any(re.search(p, t) for p in HARD):
        return True
    soft = any(re.search(p, t) for p in SOFT)
    return soft and emo["label"] in ("sadness", "fear") and emo["valence"] <= -0.4