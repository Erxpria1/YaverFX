"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

type Mode = "work" | "break";

interface TimerState {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  sessionTime: number;
  endTime: number | null;
  sessionStart: number;
}

const DEFAULT_TIMER_STATE: TimerState = {
  mode: "work",
  timeLeft: WORK_DURATION,
  isRunning: false,
  sessionTime: 0,
  endTime: null,
  sessionStart: 0,
};

function saveTimerState(state: TimerState) {
  localStorage.setItem("yaverfx-timer", JSON.stringify(state));
}

function loadTimerState(): TimerState {
  try {
    const saved = localStorage.getItem("yaverfx-timer");
    if (saved) {
      const state = JSON.parse(saved);
      // If timer was running, calculate remaining time
      if (state.isRunning && state.endTime) {
        const remaining = Math.max(0, Math.round((state.endTime - Date.now()) / 1000));
        if (remaining === 0) {
          // Timer completed while away - reset
          return DEFAULT_TIMER_STATE;
        }
        state.timeLeft = remaining;
        state.sessionStart = Date.now();
      }
      return state;
    }
  } catch (e) {}
  return DEFAULT_TIMER_STATE;
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playNote = (freq: number, start: number, dur: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.start(start);
      osc.stop(start + dur);
    };
    const now = audioContext.currentTime;
    playNote(523.25, now, 0.4);
    playNote(659.25, now + 0.15, 0.4);
    playNote(783.99, now + 0.3, 0.5);
    playNote(1046.5, now + 0.5, 0.7);
  } catch (e) {}
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendBrowserNotification(mode: Mode) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(mode === "work" ? "Çalışma bitti!" : "Mola bitti!", {
      body: mode === "work" ? "Mola zamanı 🌿" : "Tekrar çalışmaya hazır 🎯",
    });
  }
}

function useStats() {
  const [points, setPoints] = useState(0);
  
  useEffect(() => {
    const updateStats = () => {
      const stored = localStorage.getItem("yaverfx-stats");
      if (stored) {
        const stats = JSON.parse(stored);
        setPoints(stats.points || 0);
      }
    };
    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return { points };
}

export default function PomodoroTimer() {
  const [dimensions, setDimensions] = useState({ width: 260, height: 260 });

  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth * 0.7, 260);
      setDimensions({ width: w, height: w });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { width: size } = dimensions;
  
  // Load persisted timer state
  const [timerState, setTimerState] = useState<TimerState>(DEFAULT_TIMER_STATE);
  
  useEffect(() => {
    setTimerState(loadTimerState());
  }, []);
  
  // Save timer state whenever it changes
  useEffect(() => {
    saveTimerState(timerState);
  }, [timerState]);

  const { mode, timeLeft, isRunning, sessionTime, endTime, sessionStart } = timerState;
  
  const setMode = (newMode: Mode) => setTimerState(prev => ({ ...prev, mode: newMode, timeLeft: newMode === "work" ? WORK_DURATION : BREAK_DURATION }));
  const setTimeLeft = (time: number) => setTimerState(prev => ({ ...prev, timeLeft: time }));
  const setIsRunning = (running: boolean) => setTimerState(prev => ({ ...prev, isRunning: running }));
  const setSessionTime = (time: number) => setTimerState(prev => ({ ...prev, sessionTime: time }));
  
  const endTimeRef = useRef<number | null>(timerState.endTime);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const noSleepVideoRef = useRef<HTMLVideoElement | null>(null);
  const sessionStartRef = useRef<number>(timerState.sessionStart);
  const { points } = useStats();

  // Sync ref with state
  useEffect(() => {
    endTimeRef.current = timerState.endTime;
    sessionStartRef.current = timerState.sessionStart;
  }, [timerState.endTime, timerState.sessionStart]);

  const updateStats = (updates: any) => {
    try {
      const stored = localStorage.getItem("yaverfx-stats");
      const current = stored ? JSON.parse(stored) : { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };
      const updated = { ...current, ...updates };
      localStorage.setItem("yaverfx-stats", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('yaverfx-stats-update'));
    } catch (e) {}
  };

  const acquireWakeLock = useCallback(async () => {
    if ("wakeLock" in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch (e) {
        if (!noSleepVideoRef.current) {
          const video = document.createElement("video");
          video.setAttribute("playsinline", "");
          video.setAttribute("muted", "");
          video.setAttribute("loop", "");
          video.autoplay = true;
          video.style.cssText = "position:fixed;left:-1px;top:-1px;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1";
          video.src = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhm";
          noSleepVideoRef.current = video;
          document.body.appendChild(video);
          await video.play().catch(() => {});
        }
      }
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    if (noSleepVideoRef.current) {
      noSleepVideoRef.current.pause();
      noSleepVideoRef.current.remove();
      noSleepVideoRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      acquireWakeLock();
      requestNotificationPermission();
      if (!sessionStartRef.current) {
        sessionStartRef.current = Date.now();
        setTimerState(prev => ({ ...prev, sessionStart: Date.now() }));
      }
    } else {
      releaseWakeLock();
    }
  }, [isRunning, acquireWakeLock, releaseWakeLock]);

  useEffect(() => {
    if (!isRunning) return;
    const handleVis = () => {
      if (document.visibilityState === "visible") {
        acquireWakeLock();
      }
    };
    const handlePageHide = () => { releaseWakeLock(); };
    document.addEventListener("visibilitychange", handleVis);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVis);
      window.removeEventListener("pagehide", handlePageHide);
      releaseWakeLock();
    };
  }, [isRunning, acquireWakeLock, releaseWakeLock]);

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    sendBrowserNotification(mode);
    
    if (mode === "work") {
      const sessionMinutes = Math.round(sessionTime / 60);
      const earnedPoints = 10 + (sessionMinutes >= 25 ? 5 : 0);
      const currentStats = JSON.parse(localStorage.getItem("yaverfx-stats") || '{"focusTime":0,"tasksDone":0,"streak":0,"points":0}');
      
      updateStats({
        focusTime: currentStats.focusTime + sessionMinutes,
        points: currentStats.points + earnedPoints,
        streak: currentStats.streak + 1,
      });
      setTimerState(prev => ({ ...prev, sessionTime: 0, sessionStart: 0 }));
    }
  }, [mode, sessionTime]);

  const toggleTimer = () => {
    if (!isRunning) {
      const newEndTime = Date.now() + timeLeft * 1000;
      setTimerState(prev => ({ 
        ...prev, 
        isRunning: true, 
        endTime: newEndTime,
        sessionStart: Date.now()
      }));
    } else {
      // Save session time when pausing
      if (sessionStartRef.current > 0) {
        const elapsed = (Date.now() - sessionStartRef.current) / 1000;
        setTimerState(prev => ({ 
          ...prev, 
          isRunning: false, 
          sessionTime: prev.sessionTime + elapsed,
          endTime: null,
          sessionStart: 0
        }));
      } else {
        setTimerState(prev => ({ ...prev, isRunning: false, endTime: null }));
      }
    }
  };

  const resetTimer = () => {
    // Save session time before reset
    let newSessionTime = sessionTime;
    if (isRunning && sessionStartRef.current > 0) {
      newSessionTime += (Date.now() - sessionStartRef.current) / 1000;
    }
    
    setTimerState({
      ...DEFAULT_TIMER_STATE,
      sessionTime: newSessionTime,
    });
    sessionStartRef.current = 0;
  };

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      
      // Update session time while running
      if (mode === "work" && sessionStartRef.current > 0) {
        setTimerState(prev => ({ 
          ...prev, 
          sessionTime: prev.sessionTime + 0.2 
        }));
      }
      
      if (remaining === 0) {
        handleTimerComplete();
        setTimerState(prev => {
          const nextMode = prev.mode === "work" ? "break" : "work";
          return {
            ...prev,
            mode: nextMode,
            timeLeft: nextMode === "work" ? WORK_DURATION : BREAK_DURATION,
            endTime: Date.now() + (nextMode === "work" ? WORK_DURATION : BREAK_DURATION) * 1000,
            sessionTime: 0,
            sessionStart: Date.now(),
          };
        });
      } else {
        setTimerState(prev => ({ ...prev, timeLeft: remaining }));
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [isRunning, handleTimerComplete, mode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
  const stroke = Math.max(size / 25, 12);
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;
  const progress = (mode === "work" ? WORK_DURATION : BREAK_DURATION - timeLeft) / (mode === "work" ? WORK_DURATION : BREAK_DURATION);

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

      <div className="points-display">
        <span className="points-label">Toplam Puan</span>
        <span className="points-value">{points}</span>
      </div>
    </div>
  );
}