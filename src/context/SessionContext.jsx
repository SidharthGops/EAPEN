import React, { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext(null);

const SESSION_KEY = "eapen.session_id";
const PERSONA_KEY = "eapen.persona";

export const PERSONAS = [
  { id: "warm", name: "Warm", blurb: "Gentle, encouraging, checks in often." },
  { id: "steady", name: "Steady", blurb: "Calm and even, low on small talk." },
  { id: "direct", name: "Direct", blurb: "Concise, practical, gets to the point." },
];

export function SessionProvider({ children }) {
  const [sessionId, setSessionIdState] = useState(() =>
    localStorage.getItem(SESSION_KEY)
  );
  const [persona, setPersonaState] = useState(
    () => localStorage.getItem(PERSONA_KEY) || "warm"
  );

  const setSessionId = (id) => {
    setSessionIdState(id);
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  };

  const setPersona = (id) => {
    setPersonaState(id);
    localStorage.setItem(PERSONA_KEY, id);
    // TODO: once the backend exposes PATCH /api/sessions/{id}, push the
    // persona choice there so replies + TTS voice actually change.
  };

  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
  }, [sessionId]);

  const personaInfo = PERSONAS.find((p) => p.id === persona) || PERSONAS[0];

  return (
    <SessionContext.Provider
      value={{ sessionId, setSessionId, persona, setPersona, personaInfo }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
