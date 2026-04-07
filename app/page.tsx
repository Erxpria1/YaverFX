"use client";

import { useState, useEffect } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import TaskList from "./components/TaskList";
import AmbientSounds from "./components/AmbientSounds";
import SiteBlocker from "./components/SiteBlocker";
import RewardSystem from "./components/RewardSystem";
import ThemeSelector from "./components/ThemeSelector";

type Page = "timer" | "tasks" | "sounds" | "blocker" | "rewards";

// Stats data (can be connected to real data later)
const STATS = {
  focusTime: 127,
  tasksDone: 23,
  streak: 5,
  points: 450,
};

// Trending items
const TRENDING_ITEMS = [
  { id: "pomodoro", label: "Pomodoro Maratonu", onClick: () => {} },
  { id: "nature", label: "Orman Sesleri", onClick: () => {} },
  { id: "deep", label: "Deep Focus", onClick: () => {} },
];

const TimerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const TasksIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const SoundsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

const BlockerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M4.93 4.93l14.14 14.14"/>
  </svg>
);

const RewardsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-7-4-7 4l1.523-9.11"/>
  </svg>
);

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "timer", label: "Timer", icon: <TimerIcon /> },
  { id: "tasks", label: "Görevler", icon: <TasksIcon /> },
  { id: "sounds", label: "Sesler", icon: <SoundsIcon /> },
  { id: "blocker", label: "Engelle", icon: <BlockerIcon /> },
  { id: "rewards", label: "Ödüller", icon: <RewardsIcon /> },
];

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("timer");
  const [stats, setStats] = useState(STATS);
  
  // Update stats from localStorage or state
  useEffect(() => {
    // Could connect to actual data sources here
    const stored = localStorage.getItem("yaverfx-stats");
    if (stored) {
      try {
        setStats({ ...STATS, ...JSON.parse(stored) });
      } catch {}
    }
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
  
  const text = "var(--theme-text)";

  return (
    <div className="app-container">
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{stats.focusTime}</div>
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

      {/* Header */}
      <header className="app-header">
        <h1 style={{ fontSize: "18px", fontWeight: "600", color: text }}>
          YaverFX
        </h1>
      </header>
      
      {/* Trending Bar */}
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
            onClick={() => setCurrentPage(item.id)}
            className={`nav-btn ${currentPage === item.id ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}