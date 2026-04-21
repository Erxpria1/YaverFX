"use client";

import { useMemo } from "react";
import { Coffee, Pause, Play, RotateCcw, Zap } from "lucide-react";
import { useTimer } from "../context/TimerContext";

export default function PomodoroTimer() {
  const { mode, isRunning, display, progress, toggleTimer, resetTimer, setMode, mounted } = useTimer();

  if (!mounted) {
    return (
      <div className="timer-stage">
        <div className="timer-skeleton" />
      </div>
    );
  }

  const [mins, secs] = display.split(":");

  const ringSize = 280;
  const ringStroke = 6;
  const ringRadius = (ringSize - ringStroke * 2) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const dashOffset = circumference * (1 - progress);

  // SVG arc path for the progress
  const strokeDashoffset = circumference * (1 - progress);

  const accentColor = mode === "work" ? "var(--accent)" : "#4ade80";

  return (
    <div className="timer-stage">
      {/* Header */}
      <div className="timer-head">
        <span className="timer-eyebrow">
          {mode === "work" ? "Derin çalışma" : "Zihin tazeleme"}
        </span>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle" role="tablist">
        <button
          role="tab"
          onClick={() => setMode("work")}
          className={`mode-btn ${mode === "work" ? "active" : ""}`}
          aria-selected={mode === "work"}
        >
          <Zap size={14} />
          <span>Odak</span>
        </button>
        <button
          role="tab"
          onClick={() => setMode("break")}
          className={`mode-btn ${mode === "break" ? "active" : ""}`}
          aria-selected={mode === "break"}
        >
          <Coffee size={14} />
          <span>Mola</span>
        </button>
      </div>

      {/* Timer Ring */}
      <div className="timer-ring-area">
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="timer-ring-svg"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={ringStroke}
          />
          {/* Progress arc */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke={accentColor}
            strokeWidth={ringStroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s" }}
          />
        </svg>

        {/* Center Content */}
        <div className="timer-center">
          <div className="timer-time">
            <span className="time-min">{mins}</span>
            <span className="time-sep">:</span>
            <span className="time-sec">{secs}</span>
          </div>
          <div className="timer-sub">
            {isRunning ? "ODAK" : "HAZIR"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="timer-actions">
        <button
          onClick={toggleTimer}
          className={`action-primary ${isRunning ? "running" : ""}`}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          <span>{isRunning ? "Duraklat" : "Başlat"}</span>
        </button>

        <button onClick={resetTimer} className="action-ghost">
          <RotateCcw size={16} />
          <span>Sıfırla</span>
        </button>
      </div>
    </div>
  );
}
