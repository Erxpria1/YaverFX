"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { playNotificationSound } from "../utils/audio";
import { requestNotificationPermission, sendBrowserNotification } from "../utils/notifications";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

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

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initial load from localStorage
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const loadState = () => {
      const saved = localStorage.getItem("yaverfx-timer");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.isRunning && parsed.endTime) {
            const remaining = Math.max(0, Math.round((parsed.endTime - Date.now()) / 1000));
            if (remaining > 0) {
              setState({ ...parsed, timeLeft: remaining });
            } else {
              setState(DEFAULT_STATE);
            }
          } else {
            setState(parsed);
          }
        } catch {
          setState(DEFAULT_STATE);
        }
      }
      setMounted(true);
    };
    loadState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStats = useCallback((updates: Partial<Stats>) => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("yaverfx-stats");
    const current = stored ? JSON.parse(stored) : { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };
    const updated = { ...current, ...updates };
    localStorage.setItem("yaverfx-stats", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('yaverfx-stats-update'));
  }, []);

  // Persist state changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("yaverfx-timer", JSON.stringify(state));
    }
  }, [state, mounted]);

  // Wake Lock & Keep Alive Logic
  const enableKeepAlive = useCallback(async () => {
    if (typeof window === "undefined") return;

    // 1. Try Native Wake Lock API
    if ("wakeLock" in navigator) {
      try {
        if (!wakeLock.current) {
          wakeLock.current = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("Wake Lock failed", err);
      }
    }

    // 2. Video Fallback (Crucial for iOS PWA)
    // Needs user gesture to play, so we call this from onClick
    if (!videoRef.current) {
      const video = document.createElement("video");
      video.setAttribute("playsinline", "");
      video.setAttribute("muted", "");
      video.setAttribute("loop", "");
      video.muted = true;
      video.playsInline = true;
      video.style.cssText = "position:fixed;left:-1px;top:-1px;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1";
      video.src = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhm";
      videoRef.current = video;
      document.body.appendChild(video);
    }
    
    videoRef.current.play().catch(() => {
      /* Might fail if no user gesture */
    });
  }, []);

  const disableKeepAlive = useCallback(() => {
    if (wakeLock.current) {
      wakeLock.current.release().catch(() => {});
      wakeLock.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Lifecycle for wake lock
  useEffect(() => {
    if (!state.isRunning) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") enableKeepAlive();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [state.isRunning, enableKeepAlive]);

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    disableKeepAlive();
    sendBrowserNotification(
      state.mode === "work" ? "Çalışma seansı tamamlandı!" : "Mola süresi bitti!",
      state.mode === "work" ? "Harika iş çıkardın, şimdi biraz dinlenme vakti. 🌿" : "Yeterince dinlendin, şimdi tekrar odaklanma zamanı! 🎯"
    );

    if (state.mode === "work") {
      const sessionMinutes = Math.round(state.sessionTime / 60);
      const earnedPoints = 10 + (sessionMinutes >= 25 ? 5 : 0);
      
      const stored = localStorage.getItem("yaverfx-stats");
      const currentStats = stored ? JSON.parse(stored) : { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };
      
      updateStats({
        focusTime: currentStats.focusTime + sessionMinutes,
        points: currentStats.points + earnedPoints,
        streak: currentStats.streak + 1,
      });
      setState(prev => ({ ...prev, sessionTime: 0 }));
    }
  }, [state.mode, state.sessionTime, updateStats, disableKeepAlive]);

  useEffect(() => {
    if (!state.isRunning || !mounted) return;
    const interval = setInterval(() => {
      if (!state.endTime) return;
      const remaining = Math.max(0, Math.round((state.endTime - Date.now()) / 1000));
      
      if (remaining === 0) {
        handleTimerComplete();
        const nextMode = state.mode === "work" ? "break" : "work";
        const duration = nextMode === "work" ? WORK_DURATION : BREAK_DURATION;
        setState(prev => ({
          ...prev,
          mode: nextMode,
          timeLeft: duration,
          endTime: Date.now() + duration * 1000,
          sessionTime: 0,
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          timeLeft: remaining,
          sessionTime: prev.mode === "work" ? prev.sessionTime + 0.2 : prev.sessionTime 
        }));
      }
    }, 200);
    return () => clearInterval(interval);
  }, [state.isRunning, state.endTime, state.mode, handleTimerComplete, mounted]);

  const toggleTimer = () => {
    if (!state.isRunning) {
      requestNotificationPermission();
      enableKeepAlive(); // Direct user gesture!
      setState(prev => ({ ...prev, isRunning: true, endTime: Date.now() + prev.timeLeft * 1000 }));
    } else {
      disableKeepAlive();
      setState(prev => ({ ...prev, isRunning: false, endTime: null }));
    }
  };

  const resetTimer = () => {
    disableKeepAlive();
    setState(DEFAULT_STATE);
  };

  const setMode = (mode: Mode) => {
    disableKeepAlive();
    setState({ ...DEFAULT_STATE, mode, timeLeft: mode === "work" ? WORK_DURATION : BREAK_DURATION });
  };

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
