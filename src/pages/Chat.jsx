import React, { useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";
import { useSession } from "../context/SessionContext.jsx";
import ChatBubble from "../components/ChatBubble.jsx";
import Composer from "../components/Composer.jsx";
import ChatIntro from "../components/ChatIntro.jsx";
import { PageHeader } from "../components/Layout.jsx";
import "./Chat.css";

export default function Chat() {
  const { sessionId, setSessionId } = useSession();
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Make sure we have a session before anything else happens.
  useEffect(() => {
    if (sessionId) return;
    api
      .createSession()
      .then((res) => setSessionId(res.session_id))
      .catch((err) => setError(err.message));
  }, [sessionId, setSessionId]);

  // Load prior messages for this session, if any.
  useEffect(() => {
    if (!sessionId) return;
    api
      .getMessages(sessionId)
      .then((history) =>
        setMessages(
          history.map((m) => ({
            role: m.role,
            text: m.text,
            emotion: m.emotion,
          }))
        )
      )
      .catch(() => {
        /* fresh session, nothing to load yet — not an error */
      });
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const pushMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const handleSendText = async (text) => {
    if (!sessionId) return;
    pushMessage({ role: "user", text });
    setSending(true);
    setError(null);
    try {
      const res = await api.sendMessage(sessionId, text);
      pushMessage({
        role: "agent",
        text: res.reply,
        emotion: res.emotion,
        crisisFlag: res.crisis_flag,
      });
    } catch (err) {
      setError("Couldn't reach the backend. Check that the FastAPI server is running.");
    } finally {
      setSending(false);
    }
  };

  const handleSendAudio = async (blob) => {
    if (!sessionId) return;
    setSending(true);
    setError(null);
    try {
      const res = await api.sendAudio(sessionId, blob);
      pushMessage({ role: "user", text: res.transcript || "(voice message)" });
      pushMessage({
        role: "agent",
        text: res.reply,
        emotion: res.emotion,
        crisisFlag: res.crisis_flag,
      });
    } catch (err) {
      setError("Couldn't reach the backend. Check that the FastAPI server is running.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-page">
      <PageHeader
        title="Chat"
        subtitle={sessionId ? `Session ${sessionId.slice(0, 8)}` : "Starting a session…"}
      />

      <div className={`chat-scroll ${messages.length === 0 ? "is-empty" : ""}`} ref={scrollRef}>
        {messages.length === 0 && !sending && <ChatIntro />}

        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            role={m.role}
            text={m.text}
            emotion={m.emotion}
            crisisFlag={m.crisisFlag}
          />
        ))}

        {sending && (
          <div className="typing-row">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
      </div>

      {error && <div className="chat-error">{error}</div>}

      <div className="chat-composer-wrap">
        <Composer onSendText={handleSendText} onSendAudio={handleSendAudio} disabled={sending || !sessionId} />
      </div>
    </div>
  );
}
