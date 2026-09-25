import time
import uuid

from dotenv import load_dotenv

load_dotenv()  # must run before emotion/llm import (they read env vars)

from fastapi import FastAPI, File, Form, HTTPException, UploadFile  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel  # noqa: E402

import crisis  # noqa: E402
import emotion  # noqa: E402
import llm  # noqa: E402

app = FastAPI(title="EAPEN backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (no DB for the 30% submission). Resets when the server restarts.
SESSIONS: dict[str, dict] = {}


class ChatIn(BaseModel):
    session_id: str
    message: str


def _get(sid: str) -> dict:
    s = SESSIONS.get(sid)
    if not s:
        raise HTTPException(404, "session not found")
    return s


def _turn(s: dict, text: str, emo: dict) -> dict:
    flag = crisis.is_crisis(text, emo)
    if s["title"] == "New chat":
        s["title"] = text[:40]
    s["messages"].append(
        {"role": "user", "content": text, "emotion": emo, "timestamp": time.time()}
    )
    # Hard short-circuit: crisis never goes through the LLM
    reply = crisis.CRISIS_REPLY if flag else llm.reply(s["messages"], emo)
    s["messages"].append(
        {"role": "assistant", "content": reply, "crisis_flag": flag, "timestamp": time.time()}
    )
    return {"session_id": s["id"], "reply": reply, "emotion": emo, "crisis_flag": flag}


@app.post("/api/sessions")
def create_session():
    sid = uuid.uuid4().hex[:12]
    SESSIONS[sid] = {"id": sid, "title": "New chat", "created_at": time.time(), "messages": []}
    return {"id": sid, "session_id": sid, "title": "New chat", "created_at": SESSIONS[sid]["created_at"]}


@app.get("/api/sessions")
def list_sessions():
    rows = [
        {"session_id": s["id"], "title": s["title"], "started_at": s["created_at"], "last_emotion": s["messages"][-1]["emotion"]["label"] if s["messages"] else None}
        for s in SESSIONS.values()
    ]
    return sorted(rows, key=lambda r: r["started_at"], reverse=True)


@app.post("/api/chat")
def chat(body: ChatIn):
    s = _get(body.session_id)
    text = body.message.strip()
    if not text:
        raise HTTPException(422, "empty message")
    return _turn(s, text, emotion.analyze_text(text))


@app.post("/api/chat/audio")
def chat_audio(session_id: str = Form(...), audio: UploadFile = File(...)):
    s = _get(session_id)
    transcript, emo = emotion.analyze_audio(audio.file.read())
    if not transcript:
        raise HTTPException(422, "couldn't make out any speech")
    out = _turn(s, transcript, emo)
    out["transcript"] = transcript
    return out


@app.get("/api/sessions/{sid}/messages")
def messages(sid: str):
    return [
        {"id": i, "role": m["role"], "text": m["content"], "emotion": m.get("emotion"), "created_at": m["timestamp"]}
        for i, m in enumerate(_get(sid)["messages"])
    ]


@app.get("/api/sessions/{sid}/emotion-trend")
def emotion_trend(sid: str):
    return [
        {
            "timestamp": m["timestamp"],
            "label": m["emotion"]["label"],
            "valence": m["emotion"]["valence"],
            "arousal": m["emotion"]["arousal"],
        }
        for m in _get(sid)["messages"]
        if m["role"] == "user"
    ]