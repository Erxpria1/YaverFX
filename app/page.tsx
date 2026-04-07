"use client";

import { useState, useEffect } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import TaskList from "./components/TaskList";
import AmbientSounds from "./components/AmbientSounds";
import SiteBlocker from "./components/SiteBlocker";
import RewardSystem from "./components/RewardSystem";
import ThemeSelector from "./components/ThemeSelector";

type Page = "timer" | "tasks" | "sounds" | "blocker" | "rewards";

interface Stats {
  focusTime: number;
  tasksDone: number;
  streak: number;
  points: number;
}

const DEFAULT_STATS: Stats = {
  focusTime: 0,
  tasksDone: 0,
  streak: 0,
  points: 0,
};

const NAV_ITEMS = [
  { id: "timer", label: "Timer", emoji: "⏱️" },
  { id: "tasks", label: "Görevler", emoji: "✅" },
  { id: "sounds", label: "Sesler", emoji: "🎵" },
  { id: "blocker", label: "Engelle", emoji: "🚫" },
  { id: "rewards", label: "Ödüller", emoji: "🏆" },
];

let statsListeners: ((stats: Stats) => void)[] = [];

export function updateStats(updates: Partial<Stats>) {
  const stored = localStorage.getItem("yaverfx-stats");
  const current = stored ? { ...DEFAULT_STATS, ...JSON.parse(stored) } : { ...DEFAULT_STATS };
  const updated = { ...current, ...updates };
  localStorage.setItem("yaverfx-stats", JSON.stringify(updated));
  statsListeners.forEach(fn => fn(updated));
}

export function subscribeToStats(callback: (stats: Stats) => void) {
  statsListeners.push(callback);
  return () => { statsListeners = statsListeners.filter(fn => fn !== callback); };
}

export function getStats(): Stats {
  const stored = localStorage.getItem("yaverfx-stats");
  return stored ? { ...DEFAULT_STATS, ...JSON.parse(stored) } : { ...DEFAULT_STATS };
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("timer");
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("yaverfx-page");
    if (saved && ["timer", "tasks", "sounds", "blocker", "rewards"].includes(saved)) {
      setCurrentPage(saved as Page);
    }
    const savedFocus = localStorage.getItem("yaverfx-focus-mode");
    if (savedFocus === "true") setFocusMode(true);
  }, []);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    localStorage.setItem("yaverfx-page", page);
  };

  const toggleFocusMode = () => {
    const newFocus = !focusMode;
    setFocusMode(newFocus);
    localStorage.setItem("yaverfx-focus-mode", String(newFocus));
  };

  useEffect(() => {
    setStats(getStats());
    const unsubscribe = subscribeToStats(setStats);
    return unsubscribe;
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "timer": return <PomodoroTimer />;
      case "tasks": return <TaskList />;
      case "sounds": return <AmbientSounds />;
      case "blocker": return <SiteBlocker />;
      case "rewards": return <RewardSystem />;
      default: return <PomodoroTimer />;
    }
  };

  return (
    <div className={`app-container ${focusMode ? "focus-mode" : ""}`}>
      {/* Focus Banner */}
      {focusMode && (
        <div className="focus-banner">
          <span>🎯 Focus Modu</span>
          <button onClick={toggleFocusMode}>Kapat</button>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <h1>YaverFX</h1>
        <button 
          onClick={toggleFocusMode}
          className={`focus-btn-small ${focusMode ? "active" : ""}`}
        >
          {focusMode ? "✓" : "○"}
        </button>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {renderPage()}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePageChange(item.id as Page)}
            className={`tab-btn ${currentPage === item.id ? "active" : ""}`}
          >
            <span className="tab-emoji">{item.emoji}</span>
            <span className="tab-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}