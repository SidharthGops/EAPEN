# EAPEN frontend

React + Vite client for the EAPEN emotionally-aware voice agent. Talks to a
FastAPI backend over REST (see `src/api/client.js` for the exact contract).

## Pages

- **Chat** (`/`) — text + voice conversation, each reply tagged with the
  detected emotion.
- **History** (`/history`) — past sessions, reopen any of them.
- **Insights** (`/insights`) — valence/arousal trend for the active session.
- **Settings** (`/settings`) — persona choice, session reset, API endpoint.

## Run it

```bash
npm install
cp .env.example .env   # optional — only needed if not using the dev proxy
npm run dev
```

Opens on `http://localhost:5173`. By default it proxies `/api` and `/ws` to
`http://localhost:8000` (see `vite.config.js`) — start your FastAPI server
on port 8000 and there's nothing else to configure.

## Connecting your FastAPI backend

The client expects these routes (adjust `src/api/client.js` if yours differ):

| Method | Path                                 | Purpose                        |
|--------|---------------------------------------|---------------------------------|
| POST   | `/api/sessions`                       | create a session                |
| GET    | `/api/sessions`                       | list sessions                   |
| POST   | `/api/chat`                           | send a text message             |
| POST   | `/api/chat/audio`                     | send a recorded voice message   |
| GET    | `/api/sessions/{id}/messages`         | load a session's history        |
| GET    | `/api/sessions/{id}/emotion-trend`    | valence/arousal over time       |

If you call the backend directly (no dev proxy — e.g. `VITE_API_BASE_URL`
points at another origin), enable CORS in FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Voice input, right now

There's no backend yet, so the mic button doesn't just sit there uselessly:
in Chrome/Edge it uses the browser's built-in Web Speech API to transcribe
what you say **live, on-device**, right into the text field — you can edit
it, then hit Send like any typed message. You'll also see a real audio
waveform (driven by an `AnalyserNode` reading your actual mic input) and a
recording timer while it's listening.

In browsers without that API (Firefox, Safari), it falls back to recording
raw audio and POSTing it to `/api/chat/audio` — which will fail until that
route exists on your backend.

**When your FastAPI STT is ready:** in `src/components/Composer.jsx`, either
keep the dictation path as the primary UX and only use `onSendAudio` as the
non-Chrome fallback (as it is now), or switch entirely to server-side STT
by removing the `supportsDictation` branch and always calling `onSendAudio`
with the recorded blob.

## Where to extend next

- Swap the REST `/api/chat` call for a `/ws/chat/{session_id}` WebSocket for
  token-by-token streaming replies.
- Wire `Settings`' persona picker to a `PATCH /api/sessions/{id}` call once
  the backend supports it.
- Add a crisis-resources panel that opens automatically when a reply's
  `crisis_flag` is true (the `Chat` page already reads that field).
