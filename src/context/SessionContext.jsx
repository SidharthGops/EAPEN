import React, { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext(null);

const STORAGE_KEY = "eapen.session_id";

export function SessionProvider({ children }) {
  const [sessionId, setSessionIdState] = useState(() =>
    localStorage.getItem(STORAGE_KEY)
  );

  const setSessionId = (id) => {
    setSessionIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
  };

  useEffect(() => {
    if (sessionId) localStorage.setItem(STORAGE_KEY, sessionId);
  }, [sessionId]);

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
