"use client";

import { useEffect, useRef } from "react";
import { useTimer } from "../context/TimerContext";

/**
 * Hook that updates the browser tab title based on timer state.
 * - Idle: '🧘 YaverFX'
 * - Work (running/paused): '⏱ MM:SS - Odaklan'
 * - Short break (running/paused): '☕ MM:SS - Kısa Mola'
 * - Long break (running/paused): '🌙 MM:SS - Uzun Mola'
 * Only updates when title actually changes to avoid unnecessary re-renders.
 */
export function useTabTitle() {
  const { mode, isRunning, timeLeft } = useTimer();
  const lastTitleRef = useRef<string | null>(null);

  useEffect(() => {
    // Format time as MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    let newTitle: string;

    if (!isRunning) {
      // Timer is idle (never started)
      newTitle = "🧘 YaverFX";
    } else {
      // Timer is running or paused - show time with mode label
      switch (mode) {
        case "work":
          newTitle = `⏱ ${timeStr} - Odaklan`;
          break;
        case "shortBreak":
          newTitle = `☕ ${timeStr} - Kısa Mola`;
          break;
        case "longBreak":
          newTitle = `🌙 ${timeStr} - Uzun Mola`;
          break;
      }
    }

    // Only update if title actually changed (avoid unnecessary re-renders)
    if (newTitle !== lastTitleRef.current) {
      document.title = newTitle;
      lastTitleRef.current = newTitle;
    }
  }, [mode, isRunning, timeLeft]);
}

/**
 * Hook that pauses the timer when the tab is hidden and resumes when visible.
 * Uses the visibilitychange event to detect tab visibility changes.
 */
export function useDocumentVisibility() {
  const { pause, resume, isRunning } = useTimer();
  const wasRunningBeforeHideRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Tab is being hidden - pause if timer is running
        if (isRunning) {
          wasRunningBeforeHideRef.current = true;
          pause();
        }
      } else {
        // Tab is becoming visible - resume if it was running before
        if (wasRunningBeforeHideRef.current) {
          wasRunningBeforeHideRef.current = false;
          resume();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, pause, resume]);
}
