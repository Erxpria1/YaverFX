"use client";

import { useCallback } from "react";
import { Coffee, Pause, Play, RotateCcw, Zap, Moon } from "lucide-react";
import { useTimer } from "../context/TimerContext";
import {
  playPixelClick,
  playPixelStart,
  playPixelPause,
  playPixelComplete,
} from "../utils/pixelSound";

export default function PomodoroTimer() {
  const {
    mode, isRunning, display, progress,
    toggleTimer, resetTimer, setMode, mounted,
    sessionCount, statusMessage,
  } = useTimer();

  const handleToggle = useCallback(() => {
    const wasRunning = isRunning;
    toggleTimer();
    if (!wasRunning) {
      playPixelStart();
    } else {
      playPixelPause();
    }
  }, [isRunning, toggleTimer]);

  const handleReset = useCallback(() => {
    playPixelClick();
    resetTimer();
  }, [resetTimer]);

  const handleSetMode = useCallback((m: "work" | "shortBreak" | "longBreak") => {
    if (m !== mode) {
      playPixelClick();
      setMode(m);
    }
  }, [mode, setMode]);

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

  const getAccentColor = () => {
    switch (mode) {
      case "work": return "var(--accent)";
      case "shortBreak": return "#4ade80";
      case "longBreak": return "#60a5fa";
    }
  };
  const accentColor = getAccentColor();

  const getModeLabel = () => {
    switch (mode) {
      case "work": return "DERIN CALISMA";
      case "shortBreak": return "KISA MOLA";
      case "longBreak": return "UZUN MOLA";
    }
  };

  return (
    <div className="timer-stage">
      {/* Eyebrow */}
      <div className="timer-head">
        <span className="timer-eyebrow">{getModeLabel()}</span>
        <span className="session-counter">#{sessionCount}</span>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle" role="tablist">
        <button
          role="tab"
          onClick={() => handleSetMode("work")}
          className={`mode-btn ${mode === "work" ? "active" : ""}`}
          aria-selected={mode === "work"}
        >
          <Zap size={12} />
          <span>ODAK</span>
        </button>
        <button
          role="tab"
          onClick={() => handleSetMode("shortBreak")}
          className={`mode-btn ${mode === "shortBreak" ? "active" : ""}`}
          aria-selected={mode === "shortBreak"}
        >
          <Coffee size={12} />
          <span>KISA MOLA</span>
        </button>
        <button
          role="tab"
          onClick={() => handleSetMode("longBreak")}
          className={`mode-btn ${mode === "longBreak" ? "active" : ""}`}
          aria-selected={mode === "longBreak"}
        >
          <Moon size={12} />
          <span>UZUN MOLA</span>
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
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={ringStroke}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke={accentColor}
            strokeWidth={ringStroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
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
          <div className="timer-sub">{statusMessage}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="timer-actions">
        <button
          onClick={handleToggle}
          className={`action-primary ${isRunning ? "running" : ""}`}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          <span>{isRunning ? "DURAKLAT" : "BASLAT"}</span>
        </button>

        <button onClick={handleReset} className="action-ghost">
          <RotateCcw size={14} />
          <span>SIFIRLA</span>
        </button>
      </div>
    </div>
  );
}
