"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

type Mode = "work" | "break";

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    playNote(523.25, now, 0.3);
    playNote(659.25, now + 0.15, 0.3);
    playNote(783.99, now + 0.3, 0.4);
    playNote(1046.5, now + 0.5, 0.6);
  } catch (e) {
    console.error("Failed to play notification sound:", e);
  }
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendBrowserNotification(mode: Mode) {
  if ("Notification" in window && Notification.permission === "granted") {
    const title = mode === "work" ? "Focus complete!" : "Break over!";
    const body = mode === "work" ? "Time for a break." : "Ready to focus?";
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  
  const endTimeRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acquireWakeLock = useCallback(async () => {
    if ("wakeLock" in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch (e) {
        console.error("Wake lock error:", e);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (e) {
        console.error("Wake lock release error:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      acquireWakeLock();
      requestNotificationPermission();
    } else {
      releaseWakeLock();
    }
    return () => releaseWakeLock();
  }, [isRunning, acquireWakeLock, releaseWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isRunning && "wakeLock" in navigator) {
        acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, acquireWakeLock]);

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
      const now = Date.now();
      const remaining = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
      if (remaining === 0) {
        handleTimerComplete();
        setMode((prev) => {
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
  
  const totalDuration = mode === "work" ? WORK_DURATION : BREAK_DURATION;
  const progress = (totalDuration - timeLeft) / totalDuration;
  
  const size = 200;
  const stroke = 8;
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;

  const accent = "var(--theme-accent)";
  const text = "var(--theme-text)";

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      {/* Tab Switcher */}
      <div className="flex bg-[var(--theme-secondary)] rounded-full p-1">
        {(["work", "break"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setTimeLeft(m === "work" ? WORK_DURATION : BREAK_DURATION); }}
            className="px-5 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: mode === m ? accent : "transparent",
              color: mode === m ? "#fff" : text,
            }}
          >
            {m === "work" ? "Çalışma" : "Mola"}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={text}
            strokeWidth={stroke}
            style={{ opacity: 0.15 }}
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
            style={{ transition: "stroke-dashoffset 0.3s" }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color: text }}>{display}</span>
          <span className="text-xs mt-1" style={{ color: accent }}>{isRunning ? (mode === "work" ? "odaklan" : "dinlen") : "hazır"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={toggleTimer}
          className="px-10 py-3 rounded-full font-semibold transition-transform active:scale-95"
          style={{ backgroundColor: accent, color: "#fff" }}
        >
          {isRunning ? "Duraklat" : "Başlat"}
        </button>
        <button
          onClick={resetTimer}
          className="px-8 py-3 rounded-full font-medium transition-transform active:scale-95"
          style={{ border: `1px solid ${text}`, color: text, opacity: 0.5 }}
        >
          Sıfırla
        </button>
      </div>
    </div>
  );
}
