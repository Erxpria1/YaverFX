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
  
  const svgSize = 220;
  const radius = (svgSize / 2) - 20;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;

  const accentColor = "var(--theme-accent)";
  const textColor = "var(--theme-text)";

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Mode Tabs */}
      <div className="flex gap-2 bg-[var(--theme-secondary)] p-1 rounded-full">
        <button
          onClick={() => { setMode("work"); setTimeLeft(WORK_DURATION); }}
          className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
          style={{
            backgroundColor: mode === "work" ? accentColor : "transparent",
            color: mode === "work" ? "#fff" : textColor,
          }}
        >
          Çalışma
        </button>
        <button
          onClick={() => { setMode("break"); setTimeLeft(BREAK_DURATION); }}
          className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
          style={{
            backgroundColor: mode === "break" ? accentColor : "transparent",
            color: mode === "break" ? "#fff" : textColor,
          }}
        >
          Mola
        </button>
      </div>

      {/* Timer Container */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: svgSize + 60, height: svgSize + 60 }}
      >
        {/* Outer breathing ring - animated glow */}
        <div 
          className="absolute rounded-full transition-all duration-[2000ms]"
          style={{
            width: svgSize + 40,
            height: svgSize + 40,
            background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
            animation: isRunning ? "pulse-outer 3s ease-in-out infinite" : "none",
          }}
        />

        {/* Middle ring - subtle pulse */}
        <div 
          className="absolute rounded-full"
          style={{
            width: svgSize + 20,
            height: svgSize + 20,
            border: `1px solid ${accentColor}30`,
            animation: isRunning ? "pulse-middle 2s ease-in-out infinite" : "none",
          }}
        />

        {/* Main SVG Ring */}
        <svg 
          width={svgSize} 
          height={svgSize} 
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="relative"
        >
          <defs>
            {/* Main gradient */}
            <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accentColor} />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.6" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background ring - dark track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={textColor}
            strokeWidth="3"
            style={{ opacity: 0.1 }}
          />

          {/* Progress ring with glow */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#mainGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#glow)"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference * (1 - progress),
              transition: "stroke-dashoffset 0.5s ease-out",
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            }}
          />

          {/* Animated dots on the ring when running */}
          {isRunning && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={accentColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="8 20"
              style={{
                strokeDashoffset: circumference * (1 - progress),
                transition: "stroke-dashoffset 0.5s ease-out",
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                opacity: 0.6,
                animation: "dash-move 1s linear infinite",
              }}
            />
          )}
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center">
          {/* Timer Display */}
          <span 
            className="text-5xl sm:text-6xl font-bold tracking-tight"
            style={{ 
              color: textColor,
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            {display}
          </span>
          
          {/* Status Label */}
          <span 
            className="mt-1 text-sm font-medium tracking-widest uppercase"
            style={{ 
              color: accentColor,
              letterSpacing: "0.2em",
            }}
          >
            {mode === "work" ? (isRunning ? "odaklan" : "hazır") : (isRunning ? "dinlen" : "mola")}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="px-12 py-4 rounded-full text-base font-semibold transition-all duration-300 active:scale-95 touch-manipulation shadow-lg"
          style={{
            backgroundColor: accentColor,
            color: "#fff",
            boxShadow: `0 4px 20px ${accentColor}40`,
          }}
        >
          {isRunning ? "Duraklat" : "Başlat"}
        </button>
        <button
          onClick={resetTimer}
          className="px-8 py-4 rounded-full text-base font-medium transition-all duration-300 active:scale-95 touch-manipulation"
          style={{
            border: `1px solid ${textColor}`,
            color: textColor,
            opacity: 0.4,
          }}
        >
          Sıfırla
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse-outer {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.6;
          }
        }
        
        @keyframes pulse-middle {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.05); 
            opacity: 0.6;
          }
        }
        
        @keyframes dash-move {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -56; }
        }
      `}</style>
    </div>
  );
}
