"use client";

import { useTimer } from "../context/TimerContext";
import { useEffect, useState } from "react";

export default function PomodoroTimer() {
  const { mode, isRunning, display, progress, toggleTimer, resetTimer, setMode, sessionTime, mounted } = useTimer();
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  // Simple eye tracking animation logic
  useEffect(() => {
    if (!isRunning) {
      setEyePos({ x: 0, y: 0 });
      return;
    }
    const interval = setInterval(() => {
      setEyePos({
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 4
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!mounted) return <div className="timer-stage"><div className="timer-ring-wrapper"></div></div>;

  const [mins, secs] = display.split(":");
  const size = 300;
  const stroke = 8;
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="timer-stage animate-in">
      <div className="timer-header">
        <div className="segmented-control">
          <button onClick={() => setMode("work")} className={`seg-btn ${mode === "work" ? "active" : ""}`}>ODAK</button>
          <button onClick={() => setMode("break")} className={`seg-btn ${mode === "break" ? "active" : ""}`}>MOLA</button>
        </div>
      </div>

      <div className={`timer-container ${isRunning ? "running" : ""}`}>
        <div className="timer-ring-wrapper">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={stroke} />
            <circle
              className="progress-ring-track"
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: "stroke-dashoffset 0.5s linear" }}
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
            
            <div className="timer-vertical-content">
              <div className="timer-digits">
                <span className="digit-min">{mins}</span>
                <span className="digit-sec">{secs}</span>
              </div>

              {/* Yaver's Animated Eyes */}
              <div className={`yaver-eyes ${isRunning ? "active" : "idle"}`}>
                <div className="eye">
                  <div className="pupil" style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }}></div>
                </div>
                <div className="eye">
                  <div className="pupil" style={{ transform: `translate(${eyePos.x}px, ${eyePos.y}px)` }}></div>
                </div>
              </div>

              <span className="timer-status-mini">{mode === "work" ? "ODAKLANIYOR" : "DİNLENİYOR"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="timer-controls-group">
        <button onClick={toggleTimer} className={`btn-action-main ${isRunning ? "pause" : "play"}`}>
          {isRunning ? "DURAKLAT" : "BAŞLAT"}
        </button>
        <button onClick={resetTimer} className="btn-action-reset">Sıfırla</button>
      </div>
    </div>
  );
}
