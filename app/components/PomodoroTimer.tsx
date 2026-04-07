"use client";

import { useState, useEffect, useRef } from "react";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

type Mode = "work" | "break";

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  
  // Track exact timestamp to prevent background tab throttling (timer drift)
  const endTimeRef = useRef<number | null>(null);

  const toggleTimer = () => {
    if (!isRunning) {
      // Starting or resuming: set the target end time
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    } else {
      // Pausing: stop and save the current remaining time
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

    // Check frequently but rely on absolute Date diffs for accuracy
    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      
      const now = Date.now();
      const remaining = Math.max(0, Math.round((endTimeRef.current - now) / 1000));

      if (remaining === 0) {
        // Time's up, switch modes seamlessly
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
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
  const totalDuration = mode === "work" ? WORK_DURATION : BREAK_DURATION;
  const progress = (totalDuration - timeLeft) / totalDuration;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
      <div className="flex gap-2">
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "work"
              ? "bg-rose-500/20 text-rose-400"
              : "text-zinc-500"
          }`}
        >
          Çalışma
        </span>
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "break"
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-zinc-500"
          }`}
        >
          Mola
        </span>
      </div>

      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="-rotate-90 sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px]">
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-zinc-800"
          />
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={mode === "work" ? "text-rose-500" : "text-emerald-500"}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 0.2s linear",
            }}
          />
        </svg>
        <span className="absolute text-4xl sm:text-5xl font-mono font-semibold tracking-wider text-zinc-100">
          {display}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={toggleTimer}
          className={`rounded-full px-8 py-3 text-sm font-semibold transition-colors ${
            isRunning
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              : "bg-zinc-100 text-zinc-900 hover:bg-white"
          }`}
        >
          {isRunning ? "Duraklat" : "Başlat"}
        </button>
        <button
          onClick={resetTimer}
          className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          Sıfırla
        </button>
      </div>
    </div>
  );
}