"use client";

import { useTimer } from "../context/TimerContext";

export default function PomodoroTimer() {
  const { mode, isRunning, display, progress, toggleTimer, resetTimer, setMode, sessionTime } = useTimer();
  
  const size = 260;
  const stroke = 12;
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="timer-wrapper">
      <div className="mode-switch">
        <button
          onClick={() => setMode("work")}
          className={`mode-btn ${mode === "work" ? "active" : ""}`}
        >
          Çalışma
        </button>
        <button
          onClick={() => setMode("break")}
          className={`mode-btn ${mode === "break" ? "active" : ""}`}
        >
          Mola
        </button>
      </div>

      <div className="timer-ring">
        <svg width={size} height={size}>
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          <circle
            className={isRunning ? "progress-ring animate" : "progress-ring"}
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--theme-accent)" />
              <stop offset="100%" stopColor="var(--theme-accent-light)" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="timer-display">
          <span className="timer-time">{display}</span>
          <span className="timer-status">
            {isRunning ? (mode === "work" ? "odaklan" : "dinlen") : "hazır"}
          </span>
          {mode === "work" && isRunning && (
            <span className="timer-session">+{Math.floor(sessionTime / 60)} dk</span>
          )}
        </div>
      </div>

      <div className="controls">
        <button
          onClick={toggleTimer}
          className="control-btn primary"
        >
          {isRunning ? "⏸️ Duraklat" : "▶️ Başlat"}
        </button>
        <button
          onClick={resetTimer}
          className="control-btn secondary"
        >
          🔄 Sıfırla
        </button>
      </div>
    </div>
  );
}
