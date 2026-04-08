"use client";

import { useTimer } from "../context/TimerContext";

export default function PomodoroTimer() {
  const { mode, isRunning, display, progress, toggleTimer, resetTimer, setMode, sessionTime } = useTimer();
  
  const size = 300;
  const stroke = 12;
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="timer-stage animate-in">
      <div className="timer-header">
        <div className="segmented-control">
          <button
            onClick={() => setMode("work")}
            className={`seg-btn ${mode === "work" ? "active" : ""}`}
          >
            Odak
          </button>
          <button
            onClick={() => setMode("break")}
            className={`seg-btn ${mode === "break" ? "active" : ""}`}
          >
            Mola
          </button>
        </div>
      </div>

      <div className={`timer-container ${isRunning ? "running" : ""}`}>
        <div className="timer-ring-wrapper">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth={stroke}
            />
            <circle
              className="progress-ring-track"
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="rgba(255, 55, 95, 0.05)"
              stroke="url(#gradient)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-light)" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="timer-inner">
            <div className="timer-breathing-core"></div>
            <div className="timer-content">
              <span className="timer-time-large">{display}</span>
              <span className="timer-status-text">
                {isRunning ? (mode === "work" ? "ODAKLAN" : "DİNLEN") : "HAZIR"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="timer-controls-group">
        <button
          onClick={toggleTimer}
          className={`btn-action-main ${isRunning ? "pause" : "play"}`}
        >
          {isRunning ? "DURAKLAT" : "BAŞLAT"}
        </button>
        <button
          onClick={resetTimer}
          className="btn-action-reset"
        >
          SIFIRLA
        </button>
      </div>

      {mode === "work" && isRunning && (
        <div className="session-stats animate-in">
          <span className="session-tag">Seans: {Math.floor(sessionTime / 60)} dk</span>
        </div>
      )}
    </div>
  );
}
