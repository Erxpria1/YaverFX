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

export default function PomodoroTimer() {
  const [dimensions, setDimensions] = useState({ width: 280, height: 280 });

  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth * 0.75, 280);
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
  
  const endTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acquireWakeLock = useCallback(async () => {
    if ("wakeLock" in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch (e) {}
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      acquireWakeLock();
      requestNotificationPermission();
    } else {
      releaseWakeLock();
    }
  }, [isRunning, acquireWakeLock, releaseWakeLock]);

  useEffect(() => {
    if (!isRunning) return;
    const handleVis = () => {
      if (document.visibilityState === "visible") acquireWakeLock();
    };
    document.addEventListener("visibilitychange", handleVis);
    return () => {
      document.removeEventListener("visibilitychange", handleVis);
      releaseWakeLock();
    };
  }, [isRunning, acquireWakeLock, releaseWakeLock]);

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    sendBrowserNotification(mode);
    if (mode === "work" && typeof window !== "undefined" && (window as any).addYaverFxPoints) {
      (window as any).addYaverFxPoints();
    }
  }, [mode]);

  const toggleTimer = () => {
    if (!isRunning) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    } else {
      setIsRunning(false);
      endTimeRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    setMode("work");
    setTimeLeft(WORK_DURATION);
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
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
  }, [isRunning, handleTimerComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
  const stroke = Math.max(size / 30, 8);
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;
  const progress = (mode === "work" ? WORK_DURATION : BREAK_DURATION - timeLeft) / (mode === "work" ? WORK_DURATION : BREAK_DURATION);

  const accent = "var(--theme-accent)";
  const text = "var(--theme-text)";

  return (
    <div className="flex flex-col items-center gap-6 w-full px-4">
      {/* Mode Switcher */}
      <div className="flex rounded-full p-1" style={{ backgroundColor: "var(--theme-secondary)" }}>
        <button
          onClick={() => { setMode("work"); setTimeLeft(WORK_DURATION); }}
          className="px-6 py-2 rounded-full text-sm font-medium transition-colors min-h-44"
          style={{
            backgroundColor: mode === "work" ? accent : "transparent",
            color: mode === "work" ? "#fff" : text,
          }}
        >
          Çalışma
        </button>
        <button
          onClick={() => { setMode("break"); setTimeLeft(BREAK_DURATION); }}
          className="px-6 py-2 rounded-full text-sm font-medium transition-colors min-h-44"
          style={{
            backgroundColor: mode === "break" ? accent : "transparent",
            color: mode === "break" ? "#fff" : text,
          }}
        >
          Mola
        </button>
      </div>

      {/* Timer Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={text}
            strokeWidth={stroke}
            style={{ opacity: 0.12 }}
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
            style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold" style={{ color: text }}>{display}</span>
          <span className="text-sm mt-2" style={{ color: accent }}>
            {isRunning ? (mode === "work" ? "odaklan" : "dinlen") : "hazır"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="px-12 py-4 rounded-full font-semibold transition-transform active:scale-95 min-h-44"
          style={{ 
            backgroundColor: accent, 
            color: "#fff",
            minWidth: 140,
          }}
        >
          {isRunning ? "Duraklat" : "Başlat"}
        </button>
        <button
          onClick={resetTimer}
          className="px-8 py-4 rounded-full font-medium transition-transform active:scale-95 min-h-44"
          style={{ 
            border: `1px solid ${text}`, 
            color: text,
            opacity: 0.4,
            minWidth: 100,
          }}
        >
          Sıfırla
        </button>
      </div>
    </div>
  );
}
