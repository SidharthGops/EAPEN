import React, { useEffect, useRef, useState } from "react";
import "./Composer.css";

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Text + voice input bar.
 *
 * Voice capture has two paths:
 *  - Chrome/Edge (Web Speech API available): speech is transcribed live,
 *    right in the browser, and lands in the text field for you to edit
 *    before sending. No backend needed for this part.
 *  - Other browsers: falls back to recording raw audio and handing it to
 *    onSendAudio, which needs a real /api/chat/audio endpoint to do
 *    anything with it.
 *
 * onSendText(text)   -> called when the user submits typed/dictated text
 * onSendAudio(blob)  -> called with a recorded audio Blob, fallback path only
 * disabled           -> true while a request is in flight
 */
export default function Composer({ onSendText, onSendAudio, disabled }) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState([4, 4, 4, 4, 4]);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const timerRef = useRef(null);

  const supportsDictation = Boolean(SpeechRecognitionAPI);

  useEffect(() => () => cleanup(), []);

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    recognitionRef.current?.stop();
    rafRef.current = null;
    timerRef.current = null;
  };

  const runWaveform = (stream) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let lastUpdate = 0;

    const tick = (t) => {
      analyser.getByteFrequencyData(data);
      if (t - lastUpdate > 80) {
        lastUpdate = t;
        const bars = [2, 5, 9, 13, 18].map((i) => 6 + (data[i] || 0) / 8);
        setLevels(bars);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const startDictation = () => {
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";
    finalTranscriptRef.current = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscriptRef.current += chunk + " ";
        else interim += chunk;
      }
      setText((finalTranscriptRef.current + interim).trim());
    };
    recognition.onerror = () => {
      /* mic permission issues surface via getUserMedia below already */
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startRecording = async () => {
    if (disabled || recording) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Voice capture isn't supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      runWaveform(stream);

      if (supportsDictation) startDictation();

      setText("");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert("Microphone access was denied or unavailable.");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    const hadDictation = supportsDictation;

    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // No live transcript available in this browser — hand the raw
        // clip to the backend. Requires POST /api/chat/audio to exist.
        if (!hadDictation) onSendAudio(blob);
      };
      recorder.stop();
    }

    cleanup();
    setRecording(false);
    setLevels([4, 4, 4, 4, 4]);
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const submitText = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendText(trimmed);
    setText("");
  };

  return (
    <form className="composer" onSubmit={submitText}>
      <button
        type="button"
        className={`mic-pill ${recording ? "is-recording" : ""}`}
        onClick={toggleRecording}
        aria-pressed={recording}
        aria-label={recording ? "Stop recording" : "Record a voice message"}
        title={
          supportsDictation
            ? "Dictates live into the text field"
            : "Records audio for the backend to transcribe"
        }
      >
        <span className="mic-dot" />
        {recording ? formatElapsed(elapsed) : "Mic"}
      </button>

      {recording && <Waveform levels={levels} />}

      <input
        className="composer-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          recording
            ? supportsDictation
              ? "Listening — say what's on your mind…"
              : "Recording… (transcribed by the backend)"
            : "Say what's on your mind"
        }
        readOnly={recording}
        disabled={disabled}
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

function Waveform({ levels }) {
  return (
    <div className="waveform" aria-hidden="true">
      {levels.map((h, i) => (
        <span key={i} className="waveform-bar" style={{ height: `${Math.min(h, 26)}px` }} />
      ))}
    </div>
  );
}
