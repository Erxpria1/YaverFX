"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import TaskList from "./components/TaskList";
import AmbientSounds from "./components/AmbientSounds";
import SiteBlocker from "./components/SiteBlocker";
import RewardSystem from "./components/RewardSystem";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

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

const TRENDING_ITEMS = [
  { id: "pomodoro", label: "Pomodoro Maratonu", onClick: () => {} },
  { id: "nature", label: "Orman Sesleri", onClick: () => {} },
  { id: "deep", label: "Deep Focus", onClick: () => {} },
];

const TimerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const TasksIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const SoundsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

const BlockerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M4.93 4.93l14.14 14.14"/>
  </svg>
);

const RewardsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-7-4-7 4l1.523-9.11"/>
  </svg>
);

const NAV_ITEMS = [
  { id: "timer", label: "Timer", icon: <TimerIcon /> },
  { id: "tasks", label: "Görevler", icon: <TasksIcon /> },
  { id: "sounds", label: "Sesler", icon: <SoundsIcon /> },
  { id: "blocker", label: "Engelle", icon: <BlockerIcon /> },
  { id: "rewards", label: "Ödüller", icon: <RewardsIcon /> },
];

// Global state for real-time updates
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
  return () => {
    statsListeners = statsListeners.filter(fn => fn !== callback);
  };
}

export function getStats(): Stats {
  const stored = localStorage.getItem("yaverfx-stats");
  return stored ? { ...DEFAULT_STATS, ...JSON.parse(stored) } : { ...DEFAULT_STATS };
}

export default function Home() {
  // Persist active page in localStorage
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("yaverfx-page");
      if (saved && ["timer", "tasks", "sounds", "blocker", "rewards"].includes(saved)) {
        return saved as Page;
      }
    }
    return "timer";
  });
  
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  // Save page to localStorage when changed
  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    localStorage.setItem("yaverfx-page", page);
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
    <div className="app-container">
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{Math.floor(stats.focusTime)}</div>
          <div className="stat-label">dk odak</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.tasksDone}</div>
          <div className="stat-label">görev</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">gün</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.points}</div>
          <div className="stat-label">puan</div>
        </div>
      </div>

      <header className="app-header">
        <h1>YaverFX</h1>
      </header>

      <div className="trending-bar">
        <span className="trending-label">🔥 Trend</span>
        {TRENDING_ITEMS.map((item, i) => (
          <span key={item.id}>
            <span className="trending-item" onClick={item.onClick}>{item.label}</span>
            {i < TRENDING_ITEMS.length - 1 && <span className="trending-sep">•</span>}
          </span>
        ))}
      </div>

      <main className="app-main">
        {renderPage()}
      </main>

      <nav className="app-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePageChange(item.id as Page)}
            className={`nav-btn ${currentPage === item.id ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <PWAInstallPrompt />
    </div>
  );
}