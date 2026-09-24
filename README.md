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

## Where to extend next

- Swap the REST `/api/chat` call for a `/ws/chat/{session_id}` WebSocket for
  token-by-token streaming replies.
- Wire `Settings`' persona picker to a `PATCH /api/sessions/{id}` call once
  the backend supports it.
- Add a crisis-resources panel that opens automatically when a reply's
  `crisis_flag` is true (the `Chat` page already reads that field).
