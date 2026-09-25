"""Emotion module: pretrained text + speech emotion models, Whisper ASR, simple late fusion.

Output schema (locked for team coordination):
    {label, valence, arousal, confidence, modality_agreement}
"""
import io
import os

import numpy as np
from faster_whisper import WhisperModel
# pyrefly: ignore [missing-import]
from faster_whisper.audio import decode_audio  # decodes webm/ogg/wav without system ffmpeg
from transformers import pipeline

LABELS = ["anger", "joy", "neutral", "sadness"]
IDX = {l: i for i, l in enumerate(LABELS)}

# Rough circumplex placement (valence, arousal) per label, range [-1, 1]
VA = {
    "anger": (-0.6, 0.8),
    "joy": (0.8, 0.6),
    "neutral": (0.0, 0.0),
    "sadness": (-0.7, -0.4),
}
V = np.array([VA[l][0] for l in LABELS])
A = np.array([VA[l][1] for l in LABELS])

# wav2vec2 label set -> common label set
AUDIO_MAP = {
    "angry": "anger",
    "happy": "joy",
    "neutral": "neutral",
    "sad": "sadness",
}

print("[emotion] loading text model...")
_text_clf = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None,
)

_USE_AUDIO = os.getenv("USE_AUDIO_MODEL", "1") == "1"
_audio_clf = None
if _USE_AUDIO:
    print("[emotion] loading speech emotion model...")
    _audio_clf = pipeline(
        "audio-classification",
        model="superb/wav2vec2-base-superb-er",
    )

print("[emotion] loading whisper...")
_whisper = WhisperModel(os.getenv("WHISPER_SIZE", "base"), device="cpu", compute_type="int8")
print("[emotion] ready")


def _text_vec(text: str) -> np.ndarray:
    out = _text_clf(text, truncation=True, max_length=512)
    if out and isinstance(out[0], list):  # older transformers nest the result
        out = out[0]
    d = {o["label"].lower(): o["score"] for o in out}
    return np.array([d.get(l, 0.0) for l in LABELS])


def _audio_vec(wave: np.ndarray) -> np.ndarray:
    out = _audio_clf({"raw": wave[: 16000 * 30], "sampling_rate": 16000}, top_k=8)
    v = np.zeros(len(LABELS))
    for o in out:
        lab = AUDIO_MAP.get(o["label"].lower())
        if lab:
            v[IDX[lab]] += o["score"]
    return v / max(v.sum(), 1e-9)


def fuse(p_text: np.ndarray, p_audio: np.ndarray | None = None, w_text: float = 0.6) -> dict:
    """Weighted late fusion of two probability vectors over LABELS."""
    if p_audio is None:
        p, agree = p_text, 1.0
    else:
        p = w_text * p_text + (1 - w_text) * p_audio
        agree = float(np.minimum(p_text, p_audio).sum())  # histogram overlap in [0, 1]
    i = int(p.argmax())
    return {
        "label": LABELS[i],
        "valence": round(float(p @ V), 3),
        "arousal": round(float(p @ A), 3),
        "confidence": round(float(p[i]), 3),
        "modality_agreement": round(agree, 3),
    }


def analyze_text(text: str) -> dict:
    return fuse(_text_vec(text))


def analyze_audio(data: bytes) -> tuple[str, dict]:
    """bytes of a recorded clip -> (transcript, fused emotion)."""
    wave = decode_audio(io.BytesIO(data), sampling_rate=16000)
    segments, _ = _whisper.transcribe(wave, beam_size=1)
    transcript = " ".join(s.text.strip() for s in segments).strip()
    if not transcript:
        return "", fuse(np.eye(len(LABELS))[IDX["neutral"]])
    p_text = _text_vec(transcript)
    p_audio = _audio_vec(wave) if _audio_clf is not None else None
    return transcript, fuse(p_text, p_audio)