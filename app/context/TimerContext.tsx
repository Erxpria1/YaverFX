"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import NoSleep from "nosleep.js";
import { playWorkCompleteSound, playBreakCompleteSound, requestNotificationPermission, sendBrowserNotification } from "../utils/notifications";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;
const BASE_POINTS = 10;
const STREAK_BONUS = 5;
const STREAK_THRESHOLD = 25;
const SESSION_UPDATE_INTERVAL = 200;
const SESSION_INCREMENT = SESSION_UPDATE_INTERVAL / 1000;

type Mode = "work" | "break";

interface TimerState {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  sessionTime: number;
  endTime: number | null;
}

interface Stats {
  focusTime: number;
  tasksDone: number;
  streak: number;
  points: number;
}

interface TimerContextValue extends TimerState {
  toggleTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: Mode) => void;
  updateStats: (updates: Partial<Stats>) => void;
  progress: number;
  display: string;
  mounted: boolean;
}

const DEFAULT_STATE: TimerState = {
  mode: "work",
  timeLeft: WORK_DURATION,
  isRunning: false,
  sessionTime: 0,
  endTime: null,
};

const DEFAULT_STATS: Stats = {
  focusTime: 0,
  tasksDone: 0,
  streak: 0,
  points: 0,
};

const DEFAULT_APP_NAME = "Kerem";

export function getAppName(): string {
  if (typeof window === "undefined") return DEFAULT_APP_NAME;
  return localStorage.getItem("yaverfx-app-name") || DEFAULT_APP_NAME;
}

export function setAppName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("yaverfx-app-name", name);
  window.dispatchEvent(new CustomEvent("yaverfx-name-update"));
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
      const saved = localStorage.getItem("yaverfx-timer");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isRunning && parsed.endTime) {
          const remaining = Math.max(0, Math.round((parsed.endTime - Date.now()) / 1000));
          if (remaining > 0) {
            return { ...parsed, timeLeft: remaining };
          }
          return DEFAULT_STATE;
        }
        if (typeof parsed.mode === "string" && typeof parsed.timeLeft === "number") {
          return {
            mode: parsed.mode,
            timeLeft: parsed.timeLeft,
            isRunning: false,
            sessionTime: 0,
            endTime: null,
          };
        }
      }
    } catch {
      console.warn("Failed to load timer state from localStorage");
    }
    return DEFAULT_STATE;
  });
  const mounted = true;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const noSleep = useRef<NoSleep | null>(null);
  const hasNotifiedRef = useRef(false); // Prevent double notifications

  const loadStats = useCallback((): Stats => {
    try {
      const stored = localStorage.getItem("yaverfx-stats");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "focusTime" in parsed &&
          "tasksDone" in parsed &&
          "streak" in parsed &&
          "points" in parsed
        ) {
          return {
            focusTime: Number(parsed.focusTime) || 0,
            tasksDone: Number(parsed.tasksDone) || 0,
            streak: Number(parsed.streak) || 0,
            points: Number(parsed.points) || 0,
          };
        }
      }
    } catch {
      console.warn("Failed to load stats from localStorage");
    }
    return DEFAULT_STATS;
  }, []);

  const saveStats = useCallback((stats: Stats) => {
    try {
      localStorage.setItem("yaverfx-stats", JSON.stringify(stats));
      window.dispatchEvent(new CustomEvent('yaverfx-stats-update'));
    } catch {
      console.warn("Failed to save stats to localStorage");
    }
  }, []);

  const updateStats = useCallback((updates: Partial<Stats>) => {
    if (typeof window === "undefined") return;
    const current = loadStats();
    const updated = { ...current, ...updates };
    saveStats(updated);
  }, [loadStats, saveStats]);

  // Persist state changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("yaverfx-timer", JSON.stringify(state));
    }
  }, [state, mounted]);

  const enableWakeLock = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Wake Lock API
    if ("wakeLock" in navigator && !wakeLock.current) {
      try {
        wakeLock.current = await navigator.wakeLock.request("screen");
        wakeLock.current.addEventListener("release", () => {
          wakeLock.current = null;
        });
      } catch (err) {
        console.warn("Wake Lock API failed:", err);
      }
    }

    // NoSleep.js fallback
    if (!noSleep.current) {
      noSleep.current = new NoSleep();
    }
    try {
      await noSleep.current.enable();
    } catch (err) {
      console.warn("NoSleep enable failed:", err);
    }
  }, []);

  const disableWakeLock = useCallback(() => {
    if (wakeLock.current) {
      wakeLock.current.release().catch(() => {});
      wakeLock.current = null;
    }
    if (noSleep.current) {
      noSleep.current.disable();
      noSleep.current = null;
    }
  }, []);

  const handleTimerComplete = useCallback(async () => {
    // Prevent double notification
    if (hasNotifiedRef.current) return;
    hasNotifiedRef.current = true;
    
    // Always ensure wake lock is disabled
    disableWakeLock();
    
    // Always request fresh notification permission before sending
    const permission = await requestNotificationPermission();
    
    if (state.mode === "work") {
      // Play work complete sound
      playWorkCompleteSound();
      
      // Send browser notification if permitted
      if (permission === "granted") {
        sendBrowserNotification(
          "Çalışma seansı tamamlandı! 🎯",
          "Harika iş çıkardın, şimdi biraz dinlenme vakti. 🌿"
        );
      }
      
      // Calculate and save stats
      const sessionMinutes = Math.round(state.sessionTime / 60);
      const earnedPoints = BASE_POINTS + (sessionMinutes >= STREAK_THRESHOLD ? STREAK_BONUS : 0);
      const currentStats = loadStats();
      updateStats({
        focusTime: currentStats.focusTime + sessionMinutes,
        points: currentStats.points + earnedPoints,
        streak: currentStats.streak + 1,
      });
    } else {
      // Break complete
      playBreakCompleteSound();
      
      if (permission === "granted") {
        sendBrowserNotification(
          "Mola süresi bitti! 🌿",
          "Yeterince dinlendin, şimdi tekrar odaklanma zamanı! 🎯"
        );
      }
    }
    
    // Schedule auto-transition to next mode after a brief delay
    setTimeout(() => {
      const nextMode = state.mode === "work" ? "break" : "work";
      const duration = nextMode === "work" ? WORK_DURATION : BREAK_DURATION;
      
      setState(prev => ({
        ...prev,
        mode: nextMode,
        timeLeft: duration,
        endTime: null,
        sessionTime: 0,
        isRunning: false,
      }));
      
      hasNotifiedRef.current = false;
    }, 1500);
  }, [state.mode, state.sessionTime, updateStats, disableWakeLock, loadStats]);

  // Main timer interval
  useEffect(() => {
    if (!state.isRunning || !mounted) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    enableWakeLock();

    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (!prev.endTime) return prev;
        
        const remaining = Math.max(0, Math.round((prev.endTime - Date.now()) / 1000));
        
        if (remaining === 0) {
          // Timer complete - trigger notification
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            handleTimerComplete();
          }, 0);
          
          return {
            ...prev,
            timeLeft: 0,
            isRunning: false,
          };
        }
        
        return {
          ...prev,
          timeLeft: remaining,
          sessionTime: prev.mode === "work" ? prev.sessionTime + SESSION_INCREMENT : prev.sessionTime,
        };
      });
    }, SESSION_UPDATE_INTERVAL);

    // Handle visibility change - reacquire wake lock when tab becomes visible
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && state.isRunning) {
        await enableWakeLock();
        
        // Recalculate remaining time in case tab was hidden
        setState(prev => {
          if (!prev.endTime) return prev;
          const remaining = Math.max(0, Math.round((prev.endTime - Date.now()) / 1000));
          if (remaining === 0) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setTimeout(() => handleTimerComplete(), 0);
            return { ...prev, timeLeft: 0, isRunning: false };
          }
          return { ...prev, timeLeft: remaining };
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.isRunning, state.endTime, state.mode, handleTimerComplete, mounted, enableWakeLock]);

  const toggleTimer = useCallback(async () => {
    if (!state.isRunning) {
      // Starting timer - request fresh permission each time
      const permission = await requestNotificationPermission();
      console.log("Notification permission:", permission);
      
      await enableWakeLock();
      
      setState(prev => ({
        ...prev,
        isRunning: true,
        endTime: Date.now() + prev.timeLeft * 1000,
      }));
    } else {
      // Pausing timer
      disableWakeLock();
      setState(prev => ({
        ...prev,
        isRunning: false,
        endTime: null,
      }));
    }
  }, [state.isRunning, enableWakeLock, disableWakeLock]);

  const resetTimer = useCallback(() => {
    disableWakeLock();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    hasNotifiedRef.current = false;
    setState(DEFAULT_STATE);
  }, [disableWakeLock]);

  const setMode = useCallback((mode: Mode) => {
    disableWakeLock();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    hasNotifiedRef.current = false;
    setState({
      ...DEFAULT_STATE,
      mode,
      timeLeft: mode === "work" ? WORK_DURATION : BREAK_DURATION,
    });
  }, [disableWakeLock]);

  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const total = state.mode === "work" ? WORK_DURATION : BREAK_DURATION;
  const progress = (total - state.timeLeft) / total;

  return (
    <TimerContext.Provider value={{ ...state, toggleTimer, resetTimer, setMode, updateStats, progress, display, mounted }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within a TimerProvider");
  return context;
};
