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
  
  const svgSize = 180;
  const radius = (svgSize / 2) - 15;
  const center = svgSize / 2;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const accentColor = "var(--theme-accent)";
  const textColor = "var(--theme-text)";
  const bgColor = "var(--theme-bg)";

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 py-4">
      {/* Mode Tabs */}
      <div className="flex gap-3">
        <span
          className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-700"
          style={{
            backgroundColor: mode === "work" ? accentColor : "transparent",
            color: "#fff",
            opacity: mode === "work" ? 0.2 : 0.5,
          }}
        >
          Çalışma
        </span>
        <span
          className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-700"
          style={{
            backgroundColor: mode === "break" ? accentColor : "transparent",
            color: "#fff",
            opacity: mode === "break" ? 0.2 : 0.5,
          }}
        >
          Mola
        </span>
      </div>

      {/* Timer Ring */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: svgSize, height: svgSize }}
      >
        {/* SVG Ring */}
        <svg 
          width={svgSize} 
          height={svgSize} 
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="absolute -rotate-90"
        >
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={accentColor} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={textColor}
            strokeWidth={strokeWidth}
            style={{ opacity: 0.15 }}
          />

          {/* Progress ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 0.2s linear",
            }}
          />
        </svg>

        {/* Center Display */}
        <div className="flex flex-col items-center">
          <span 
            className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold tracking-wider"
            style={{ color: textColor }}
          >
            {display}
          </span>
          <span 
            className="mt-1 text-xs font-medium uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {mode === "work" ? "odak" : "mola"}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="rounded-full px-10 py-3.5 text-sm font-semibold transition-all duration-300 active:scale-95 touch-manipulation"
          style={{
            backgroundColor: accentColor,
            color: "#fff",
          }}
        >
          {isRunning ? "Duraklat" : "Başlat"}
        </button>
        <button
          onClick={resetTimer}
          className="rounded-full px-10 py-3.5 text-sm font-semibold transition-all duration-300 active:scale-95 touch-manipulation"
          style={{
            border: `1px solid ${textColor}`,
            color: textColor,
            opacity: 0.5,
          }}
        >
          Sıfırla
        </button>
      </div>
    </div>
  );
}
