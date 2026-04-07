"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

type Mode = "work" | "break";

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
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
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

// Get updateStats from parent (injected via window)
function useStats() {
  const [points, setPoints] = useState(0);
  
  useEffect(() => {
    const updatePoints = () => {
      const stored = localStorage.getItem("yaverfx-stats");
      if (stored) {
        const stats = JSON.parse(stored);
        setPoints(stats.points || 0);
      }
    };
    updatePoints();
    const interval = setInterval(updatePoints, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return points;
}

export default function PomodoroTimer() {
  const [dimensions, setDimensions] = useState({ width: 240, height: 240 });

  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth * 0.65, 240);
      setDimensions({ width: w, height: w });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { width: size } = dimensions;
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionTime, setSessionTime] = useState(0); // Track this session's focus time
  
  const endTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const noSleepVideoRef = useRef<HTMLVideoElement | null>(null);
  const sessionStartRef = useRef<number>(0);
  const points = useStats();

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
      sessionStartRef.current = Date.now();
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
      // Award points and update stats
      const sessionMinutes = Math.round(sessionTime / 60);
      const earnedPoints = 10 + (sessionMinutes >= 25 ? 5 : 0); // Base 10 + bonus for full session
      const currentStats = JSON.parse(localStorage.getItem("yaverfx-stats") || '{"focusTime":0,"tasksDone":0,"streak":0,"points":0}');
      
      updateStats({
        focusTime: currentStats.focusTime + sessionMinutes,
        points: currentStats.points + earnedPoints,
        streak: currentStats.streak + 1,
      });
      setSessionTime(0);
    }
  }, [mode, sessionTime]);

  const toggleTimer = () => {
    if (!isRunning) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    } else {
      // Track partial session time when pausing
      if (sessionStartRef.current > 0) {
        setSessionTime(prev => prev + (Date.now() - sessionStartRef.current) / 1000);
      }
      setIsRunning(false);
      endTimeRef.current = null;
    }
  };

  const resetTimer = () => {
    // Save partial session time before reset
    if (isRunning && sessionStartRef.current > 0) {
      setSessionTime(prev => prev + (Date.now() - sessionStartRef.current) / 1000);
    }
    setIsRunning(false);
    endTimeRef.current = null;
    sessionStartRef.current = 0;
    setSessionTime(0);
    setMode("work");
    setTimeLeft(WORK_DURATION);
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      
      // Update real-time focus time
      if (mode === "work" && sessionStartRef.current > 0) {
        const elapsed = (Date.now() - sessionStartRef.current) / 1000;
        setSessionTime(prev => prev + 0.2);
      }
      
      if (remaining === 0) {
        handleTimerComplete();
        setMode(prev => {
          const next = prev === "work" ? "break" : "work";
          setTimeLeft(next === "work" ? WORK_DURATION : BREAK_DURATION);
          endTimeRef.current = Date.now() + (next === "work" ? WORK_DURATION : BREAK_DURATION) * 1000;
          return next;
        });
      } else {
        setTimeLeft(remaining);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isRunning, handleTimerComplete, mode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
  const stroke = Math.max(size / 25, 10);
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;
  const progress = (mode === "work" ? WORK_DURATION : BREAK_DURATION - timeLeft) / (mode === "work" ? WORK_DURATION : BREAK_DURATION);

  const text = "var(--theme-text)";
  const accent = "var(--theme-accent)";

  return (
    <div className="timer-wrapper">
      <div className="mode-switch">
        <button
          onClick={() => { setMode("work"); setTimeLeft(WORK_DURATION); }}
          className={`mode-btn ${mode === "work" ? "active" : ""}`}
        >
          Çalışma
        </button>
        <button
          onClick={() => { setMode("break"); setTimeLeft(BREAK_DURATION); }}
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
            stroke={text}
            strokeWidth={stroke}
            style={{ opacity: 0.1 }}
          />
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
          />
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