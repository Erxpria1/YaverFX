"use client";

import { Coffee, Pause, Play, RotateCcw, TimerReset, Zap } from "lucide-react";
import { useTimer } from "../context/TimerContext";

export default function PomodoroTimer() {
  const { mode, isRunning, display, progress, toggleTimer, resetTimer, setMode, mounted } = useTimer();

  if (!mounted) {
    return <div className="timer-stage"><div className="timer-ring-wrapper"></div></div>;
  }

  const [mins, secs] = display.split(":");
  const size = 300;
  const stroke = 14;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="timer-stage animate-in">
      <div className="timer-panel glass-card">
        <div className="timer-header">
          <div className="timer-heading">
            <span className="page-eyebrow">Odak Akışı</span>
            <h2>{mode === "work" ? "Derin çalışma zamanı" : "Zihin tazeleme zamanı"}</h2>
          </div>

          <div className="segmented-control" role="tablist" aria-label="Zamanlayıcı modu">
            <button onClick={() => setMode("work")} className={`seg-btn ${mode === "work" ? "active" : ""}`}>
              <Zap size={16} />
              <span>Odak</span>
            </button>
            <button onClick={() => setMode("break")} className={`seg-btn ${mode === "break" ? "active" : ""}`}>
              <Coffee size={16} />
              <span>Mola</span>
            </button>
          </div>
        </div>

        <div className={`timer-container ${isRunning ? "running" : ""}`}>
          <div className="timer-ring-wrapper">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="timer-ring-svg">
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff8f78" />
                  <stop offset="45%" stopColor="#ff6b5e" />
                  <stop offset="100%" stopColor="#ff3d71" />
                </linearGradient>
                <filter id="ringGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feColorMatrix
                    in="blur"
                    type="matrix"
                    values="1 0 0 0 0  0 0.65 0 0 0  0 0 0.7 0 0  0 0 0 1 0"
                  />
                </filter>
              </defs>

              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={stroke}
              />
              <circle
                className="progress-ring-glow"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                filter="url(#ringGlow)"
              />
              <circle
                className="progress-ring-track"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>

            <div className="timer-inner">
              <div className="timer-breathing-core" />
              <div className="timer-vertical-content">
                <div className="timer-status-pill">
                  <TimerReset size={15} />
                  <span>{mode === "work" ? "Odak seansı" : "Mola seansı"}</span>
                </div>

                <div className="timer-digits" aria-live="polite">
                  <span className="digit-min">{mins}</span>
                  <span className="digit-sec">{secs}</span>
                </div>

                <span className="timer-status-mini">{isRunning ? "AKIŞ DEVAM EDİYOR" : "BAŞLAMAYA HAZIR"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="timer-controls-group">
          <button onClick={toggleTimer} className={`btn-action-main ${isRunning ? "pause" : "play"}`}>
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            <span>{isRunning ? "Duraklat" : "Başlat"}</span>
          </button>
          <button onClick={resetTimer} className="btn-action-reset">
            <RotateCcw size={16} />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
