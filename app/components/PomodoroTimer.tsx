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
    const title = mode === "work" ? "Focus session complete!" : "Break is over!";
    const body = mode === "work" ? "Time for a break. You earned it!" : "Ready to focus again?";
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
        console.error("Failed to acquire wake lock:", e);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (e) {
        console.error("Failed to release wake lock:", e);
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

    return () => {
      releaseWakeLock();
    };
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
    // Add reward points if work session completed
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
        setMode((prevMode) => {
          const nextMode = prevMode === "work" ? "break" : "work";
          const nextDuration = nextMode === "work" ? WORK_DURATION : BREAK_DURATION;
          
          setTimeLeft(nextDuration);
          endTimeRef.current = Date.now() + nextDuration * 1000;
          return nextMode;
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
  
  const radius = 120;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10">
      <div className="flex gap-3">
        <span
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-700 ${
            mode === "work"
              ? "bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/20"
              : "text-zinc-600"
          }`}
        >
          Çalışma
        </span>
        <span
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-700 ${
            mode === "break"
              ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20"
              : "text-zinc-600"
          }`}
        >
          Mola
        </span>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Outer breathing glow ring */}
        <div
          className={`absolute rounded-full transition-all duration-1000 ${
            isRunning ? "animate-pulse-ring" : "opacity-0 scale-75"
          }`}
          style={{
            width: "180px",
            height: "180px",
            background: mode === "work" 
              ? "radial-gradient(circle, rgba(244,63,94,0.4) 0%, rgba(244,63,94,0) 70%)"
              : "radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0) 70%)",
          }}
        />

        {/* Secondary glow layer */}
        <div
          className={`absolute rounded-full blur-xl transition-all duration-1000 ${
            isRunning ? "animate-glow-pulse opacity-60" : "opacity-0"
          }`}
          style={{
            width: "160px",
            height: "160px",
            backgroundColor: mode === "work" ? "rgba(244,63,94,0.3)" : "rgba(16,185,129,0.3)",
          }}
        />

        {/* SVG Ring */}
        <svg 
          width="180" 
          height="180" 
          className="relative z-10 -rotate-90 sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px]"
        >
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="workGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-800/80"
          />

          {/* Inner subtle track */}
          <circle
            cx="140"
            cy="140"
            r={radius - 12}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-zinc-800/40"
          />

          {/* Progress ring with glow */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={mode === "work" ? "url(#workGradient)" : "url(#breakGradient)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 0.3s ease-in-out, stroke 1s ease",
            }}
          />

          {/* Shimmer overlay on progress */}
          {isRunning && (
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="url(#workGradient)"
              strokeWidth={strokeWidth + 2}
              strokeLinecap="round"
              opacity="0.3"
              style={{
                strokeDasharray: "8 12",
                animation: "shimmer 3s linear infinite",
                transition: "stroke 1s ease",
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute z-20 flex flex-col items-center">
          <span 
            className="text-4xl sm:text-5xl md:text-6xl font-mono font-semibold tracking-wider text-zinc-100 transition-all duration-700"
            style={{
              textShadow: isRunning ? `0 0 20px ${mode === "work" ? "rgba(244,63,94,0.5)" : "rgba(16,185,129,0.5)"}` : "none",
            }}
          >
            {display}
          </span>
          <span className={`mt-1 text-xs font-medium uppercase tracking-widest transition-colors duration-700 ${
            mode === "work" ? "text-rose-400/80" : "text-emerald-400/80"
          }`}>
            {mode === "work" ? "focus" : "relax"}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className={`rounded-full px-10 py-3.5 text-sm font-semibold transition-all duration-300 ${
            isRunning
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:shadow-lg"
              : "bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-lg hover:shadow-zinc-100/20"
          }`}
        >
          {isRunning ? "Duraklat" : "Başlat"}
        </button>
        <button
          onClick={resetTimer}
          className="rounded-full border border-zinc-700 px-10 py-3.5 text-sm font-semibold text-zinc-400 transition-all duration-300 hover:border-zinc-500 hover:text-zinc-200 hover:shadow-lg"
        >
          Sıfırla
        </button>
      </div>
    </div>
  );
}