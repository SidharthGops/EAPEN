import React, { useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";
import { useSession } from "../context/SessionContext.jsx";
import { generateDemoReply } from "../data/demoReply.js";
import ChatBubble from "../components/ChatBubble.jsx";
import Composer from "../components/Composer.jsx";
import ChatIntro from "../components/ChatIntro.jsx";
import PodStatusCard from "../components/PodStatusCard.jsx";
import { PageHeader } from "../components/Layout.jsx";
import Pill from "../components/Pill.jsx";
import "./Chat.css";

function timeLabel(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const { sessionId, setSessionId, persona, personaInfo } = useSession();
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [isSample, setIsSample] = useState(false);
  const scrollRef = useRef(null);

  // Try to open a real session with the backend. If it's unreachable, fall
  // back to a local demo session so the UI still works end to end.
  useEffect(() => {
    if (sessionId) return;
    api
      .createSession()
      .then((res) => setSessionId(res.session_id))
      .catch(() => {
        setSessionId(`demo-${Math.random().toString(36).slice(2, 8)}`);
        setIsSample(true);
      });
  }, [sessionId, setSessionId]);

  // Load prior messages for this session, if any (skip for demo sessions —
  // there's nothing on a server to fetch).
  useEffect(() => {
    if (!sessionId || isSample) return;
    api
      .getMessages(sessionId)
      .then((history) =>
        setMessages(
          history.map((m) => ({
            role: m.role,
            text: m.text,
            emotion: m.emotion,
            time: m.created_at ? timeLabel(new Date(m.created_at)) : null,
          }))
        )
      )
      .catch(() => {
        /* fresh session, nothing to load yet — not an error */
      });
  }, [sessionId, isSample]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const pushMessage = (msg) => setMessages((prev) => [...prev, msg]);
  const lastAgentEmotion = [...messages].reverse().find((m) => m.role === "agent")?.emotion;

  const replyTo = async (userText) => {
    if (!isSample) {
      try {
        return await api.sendMessage(sessionId, userText);
      } catch {
        // backend unreachable this one time — drop into demo mode so the
        // conversation can continue instead of dead-ending on an error
        setIsSample(true);
      }
    }
    // small delay so the typing indicator reads as real rather than instant
    await new Promise((r) => setTimeout(r, 500));
    return generateDemoReply(persona, userText);
  };

  const handleSendText = async (text) => {
    if (!sessionId) return;
    pushMessage({ role: "user", text, time: timeLabel(new Date()) });
    setSending(true);
    try {
      const res = await replyTo(text);
      pushMessage({
        role: "agent",
        text: res.reply,
        emotion: res.emotion,
        crisisFlag: res.crisis_flag,
        time: timeLabel(new Date()),
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendAudio = async (blob) => {
    if (!sessionId) return;
    setSending(true);
    try {
      if (!isSample) {
        const res = await api.sendAudio(sessionId, blob);
        pushMessage({ role: "user", text: res.transcript || "(voice message)", time: timeLabel(new Date()) });
        pushMessage({
          role: "agent",
          text: res.reply,
          emotion: res.emotion,
          crisisFlag: res.crisis_flag,
          time: timeLabel(new Date()),
        });
        return;
      }
    } catch {
      setIsSample(true);
    }
    // demo fallback — no server-side transcription available
    pushMessage({ role: "user", text: "(voice message)", time: timeLabel(new Date()) });
    const res = await generateDemoReply(persona, "");
    pushMessage({ role: "agent", text: res.reply, emotion: res.emotion, time: timeLabel(new Date()) });
    setSending(false);
  };

  return (
    <div className="chat-page">
      <PageHeader
        title="Chat"
        subtitle="Speak to the pod or type here. Both land in the same conversation."
        action={
          <div className="chat-header-pills">
            {isSample && <Pill>Sample mode</Pill>}
            <Pill tone="sage">{personaInfo.name} persona</Pill>
          </div>
        }
      />

      <div className="chat-scroll" ref={scrollRef}>
        <PodStatusCard emotion={lastAgentEmotion} />

        {messages.length === 0 && !sending && <ChatIntro />}

        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            role={m.role}
            text={m.text}
            emotion={m.emotion}
            crisisFlag={m.crisisFlag}
            persona={m.role === "agent" ? personaInfo.id : null}
            time={m.time}
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

      {isSample && (
        <div className="chat-notice">
          Running in sample mode — no backend at localhost:8000 yet, so replies are generated locally.
        </div>
      )}

      <div className="chat-composer-wrap">
        <Composer onSendText={handleSendText} onSendAudio={handleSendAudio} disabled={sending || !sessionId} />
      </div>
    </div>
  );
}
