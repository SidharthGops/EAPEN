import os
import requests

SYSTEM = """You are EAPEN, a warm, emotionally aware voice companion.
The user's latest message was detected as: {label} (valence {v}, arousal {a}, confidence {c}).

Rules:
- Reply in 2-4 short sentences; your reply may be spoken aloud, so no lists or markdown.
- Acknowledge the feeling first, then respond to what they said.
- If confidence is below 0.5, don't assume the emotion; stay gently neutral.
- Ask at most one gentle question.
- You are a supportive companion, not a therapist: no diagnoses, no medical advice."""

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")


def reply(messages: list[dict], emo: dict) -> str:
    system = SYSTEM.format(
        label=emo["label"], v=emo["valence"], a=emo["arousal"], c=emo["confidence"]
    )
    history = [{"role": m["role"], "content": m["content"]} for m in messages[-12:]]
    try:
        r = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "messages": [{"role": "system", "content": system}] + history,
                "stream": False,
                "options": {"temperature": 0.7, "num_predict": 200},
            },
            timeout=60,
        )
        r.raise_for_status()
        return r.json()["message"]["content"].strip()
    except Exception as e:
        print("[llm] error:", e)
        return "Sorry, I'm having trouble responding right now. Could you say that again?"