import React, { useRef, useState } from "react";
import "./Composer.css";

/**
 * Text + voice input bar.
 * onSendText(text)         -> called when the user submits typed text
 * onSendAudio(blob)        -> called with a recorded audio Blob (webm/opus)
 * disabled                 -> true while a request is in flight
 */
export default function Composer({ onSendText, onSendAudio, disabled }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const submitText = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendText(trimmed);
    setText("");
  };

  const toggleRecording = async () => {
    if (disabled) return;

    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Voice capture isn't supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        onSendAudio(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert("Microphone access was denied or unavailable.");
    }
  };

  return (
    <form className="composer" onSubmit={submitText}>
      <button
        type="button"
        className={`mic-button ${recording ? "is-recording" : ""}`}
        onClick={toggleRecording}
        aria-pressed={recording}
        aria-label={recording ? "Stop recording" : "Record a voice message"}
        title={recording ? "Stop recording" : "Record a voice message"}
      >
        <MicIcon />
      </button>

      <input
        className="composer-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={recording ? "Listening…" : "Say what's on your mind"}
        disabled={disabled || recording}
      />

      <button
        type="submit"
        className="composer-send"
        disabled={disabled || recording || !text.trim()}
      >
        Send
      </button>
    </form>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M19 11a7 7 0 0 1-14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
