"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface EmergencyTimerState {
  timeLeft: number;
  isRunning: boolean;
  endTime: number | null;
  duration: number;
}

interface EmergencyTimerStats {
  totalSessions: number;
  totalMinutes: number;
}

const PRESET_DURATIONS = [15, 20, 30, 45, 60];

const STORAGE_KEY = "yaverfx-emergency";
const STATS_KEY = "yaverfx-emergency-stats";

function loadState(): EmergencyTimerState {
  if (typeof window === "undefined") {
    return { timeLeft: 25 * 60, isRunning: false, endTime: null, duration: 25 * 60 };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isRunning && parsed.endTime) {
        const remaining = Math.max(0, Math.round((parsed.endTime - Date.now()) / 1000));
        if (remaining > 0) {
          return { ...parsed, timeLeft: remaining };
        }
      }
      return { timeLeft: parsed.duration || 25 * 60, isRunning: false, endTime: null, duration: parsed.duration || 25 * 60 };
    }
  } catch {
    console.warn("Failed to load emergency timer state");
  }
  return { timeLeft: 25 * 60, isRunning: false, endTime: null, duration: 25 * 60 };
}

function loadStats(): EmergencyTimerStats {
  if (typeof window === "undefined") return { totalSessions: 0, totalMinutes: 0 };
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        totalSessions: Number(parsed.totalSessions) || 0,
        totalMinutes: Number(parsed.totalMinutes) || 0,
      };
    }
  } catch {
    console.warn("Failed to load emergency timer stats");
  }
  return { totalSessions: 0, totalMinutes: 0 };
}

function saveState(state: EmergencyTimerState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn("Failed to save emergency timer state");
  }
}

function saveStats(stats: EmergencyTimerStats) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    console.warn("Failed to save emergency timer stats");
  }
}

export default function EmergencyTimer() {
  const [state, setState] = useState<EmergencyTimerState>(loadState);
  const [stats, setStats] = useState<EmergencyTimerStats>(loadStats);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Handle timer completion
  const handleComplete = useCallback(() => {
    // Play notification sound
    try {
      // @ts-expect-error - webkitAudioContext is non-standard
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const playTone = (freq: number, start: number, dur: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, start);
          osc.type = "sine";
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
          osc.start(start);
          osc.stop(start + dur);
        };
        playTone(523.25, now, 0.5);     // C5
        playTone(659.25, now + 0.2, 0.5); // E5
        playTone(783.99, now + 0.4, 0.6);  // G5
        playTone(1046.5, now + 0.6, 0.8);  // C6
      }
    } catch (e) {
      console.warn("Audio context failed", e);
    }

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Acil Duraklama Tamamlandı!", {
        body: "Kendine bir mola verdin. 🌿",
        icon: "/apple-touch-icon.png",
      });
    }

    // Update stats
    const minutesUsed = Math.round(state.duration / 60);
    const newStats = { ...stats, totalSessions: stats.totalSessions + 1, totalMinutes: stats.totalMinutes + minutesUsed };
    saveStats(newStats);
    setStats(newStats);

    // Stop timer
    setState(prev => ({ ...prev, isRunning: false, endTime: null, timeLeft: prev.duration }));
  }, [state.duration, stats]);

  // Timer tick effect
  useEffect(() => {
    if (!state.isRunning || !state.endTime) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((state.endTime! - Date.now()) / 1000));

      if (remaining === 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        handleComplete();
      } else {
        setState(prev => ({ ...prev, timeLeft: remaining }));
      }
    }, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, state.endTime, handleComplete]);

  const startTimer = (minutes: number) => {
    const duration = minutes * 60;
    setState({
      duration,
      timeLeft: duration,
      isRunning: true,
      endTime: Date.now() + duration * 1000,
    });
  };

  const toggleTimer = () => {
    if (state.isRunning) {
      // Pause
      setState(prev => ({ ...prev, isRunning: false, endTime: null }));
    } else {
      // Resume
      setState(prev => ({ ...prev, isRunning: true, endTime: Date.now() + prev.timeLeft * 1000 }));
    }
  };

  const resetTimer = () => {
    setState({
      duration: state.duration,
      timeLeft: state.duration,
      isRunning: false,
      endTime: null,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = state.duration > 0 ? (state.duration - state.timeLeft) / state.duration : 0;

  return (
    <div className="emergency-timer-container">
      <div className="emergency-header">
        <span className="emergency-icon">🛑</span>
        <h3>Acil Duraklama</h3>
      </div>

      {/* Timer Display */}
      <div className="emergency-display">
        <div className="emergency-progress-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--track-color)" strokeWidth="6" />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress)}`}
              style={{ transition: "stroke-dashoffset 0.5s linear" }}
            />
          </svg>
          <div className="emergency-time">{formatTime(state.timeLeft)}</div>
        </div>
      </div>

      {/* Preset Duration Buttons */}
      <div className="emergency-presets">
        {PRESET_DURATIONS.map(min => (
          <button
            key={min}
            className={`emergency-preset-btn ${state.duration === min * 60 && !state.isRunning ? "active" : ""}`}
            onClick={() => startTimer(min)}
            disabled={state.isRunning}
          >
            {min}dk
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="emergency-controls">
        <button
          className={`emergency-btn ${state.isRunning ? "pause" : "play"}`}
          onClick={toggleTimer}
          disabled={state.timeLeft === state.duration && !state.isRunning}
        >
          {state.isRunning ? "⏸ Duraklat" : "▶ Başlat"}
        </button>
        <button className="emergency-btn reset" onClick={resetTimer}>
          ↺ Sıfırla
        </button>
      </div>

      {/* Stats */}
      <div className="emergency-stats">
        <span>🔢 {stats.totalSessions} seans</span>
        <span>⏱ {stats.totalMinutes} dk</span>
      </div>
    </div>
  );
}