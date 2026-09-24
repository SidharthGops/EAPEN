/**
 * API client for the EAPEN FastAPI backend.
 *
 * Everything the UI needs from the server goes through this file, so if
 * your backend's routes differ, this is the only place you need to edit.
 *
 * Expected FastAPI contract (adjust to match your actual routes):
 *
 *   POST /api/sessions
 *     -> { session_id }
 *
 *   GET  /api/sessions
 *     -> [{ session_id, title, started_at, last_emotion }]
 *
 *   POST /api/chat
 *     body: { session_id, message }
 *     -> {
 *          reply: string,
 *          emotion: { label, valence, arousal, confidence, modality_agreement },
 *          crisis_flag: boolean,
 *          memory_used: string[]
 *        }
 *
 *   POST /api/chat/audio   (multipart/form-data, field name "audio")
 *     -> same shape as /api/chat, plus { transcript: string }
 *
 *   GET  /api/sessions/{session_id}/messages
 *     -> [{ id, role, text, emotion, created_at }]
 *
 *   GET  /api/sessions/{session_id}/emotion-trend
 *     -> [{ timestamp, valence, arousal, label }]
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Request to ${path} failed (${res.status}): ${detail || res.statusText}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export const api = {
  createSession: () => request("/api/sessions", { method: "POST" }),

  listSessions: () => request("/api/sessions"),

  sendMessage: (sessionId, message) =>
    request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, message }),
    }),

  sendAudio: (sessionId, audioBlob) => {
    const form = new FormData();
    form.append("session_id", sessionId);
    form.append("audio", audioBlob, "clip.webm");
    return request("/api/chat/audio", { method: "POST", body: form });
  },

  getMessages: (sessionId) => request(`/api/sessions/${sessionId}/messages`),

  getEmotionTrend: (sessionId) => request(`/api/sessions/${sessionId}/emotion-trend`),
};
