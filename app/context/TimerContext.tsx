"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

  // Initial load from localStorage (Client-side only)
  useEffect(() => {
    const saved = localStorage.getItem("yaverfx-timer");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isRunning && parsed.endTime) {
          const remaining = Math.max(0, Math.round((parsed.endTime - Date.now()) / 1000));
          if (remaining > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
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
  }, [state.mode, state.sessionTime, updateStats]);

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
      setState(prev => ({ ...prev, isRunning: true, endTime: Date.now() + prev.timeLeft * 1000 }));
    } else {
      setState(prev => ({ ...prev, isRunning: false, endTime: null }));
    }
  };

  const resetTimer = () => setState(DEFAULT_STATE);
  const setMode = (mode: Mode) => setState({ ...DEFAULT_STATE, mode, timeLeft: mode === "work" ? WORK_DURATION : BREAK_DURATION });

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
