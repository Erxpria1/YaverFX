"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [showNav, setShowNav] = useState(false);
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
    setShowNav(false);
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

  const currentNav = NAV_ITEMS.find(i => i.id === currentPage);

  return (
    <div className={`app-container ${focusMode ? "focus-mode" : ""}`}>
      {/* Focus Mode Banner */}
      {focusMode && (
        <div className="focus-banner">
          <span>🎯 Focus Modu Aktif</span>
          <button onClick={toggleFocusMode}>✕ Kapat</button>
        </div>
      )}

      {/* Stats Bar - Small in focus mode */}
      <div className={`stats-bar ${focusMode ? "compact" : ""}`}>
        <div className="stat-item">
          <div className="stat-value">{Math.floor(stats.focusTime)}</div>
          <div className="stat-label">dk</div>
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

      {/* Header with Focus Toggle */}
      <header className="app-header">
        <h1>YaverFX</h1>
        <div className="header-actions">
          <button 
            onClick={toggleFocusMode}
            className={`focus-toggle ${focusMode ? "active" : ""}`}
          >
            {focusMode ? "🎯" : "🎯"} {focusMode ? "Aktif" : "Focus"}
          </button>
          <ThemeSelector />
        </div>
      </header>

      {/* Current Page Title */}
      <div className="page-indicator">
        <span className="page-emoji">{currentNav?.emoji}</span>
        <span className="page-title">{currentNav?.label}</span>
        <button onClick={() => setShowNav(true)} className="menu-btn">☰</button>
      </div>

      {/* Main Content */}
      <main className="app-main">
        {renderPage()}
      </main>

      {/* Bottom Nav Trigger */}
      <button className="nav-trigger" onClick={() => setShowNav(true)}>
        <span>{currentNav?.emoji} {currentNav?.label}</span>
        <span className="nav-arrow">▲</span>
      </button>

      {/* Navigation Modal */}
      {showNav && (
        <div className="nav-overlay" onClick={() => setShowNav(false)}>
          <div className="nav-modal" onClick={e => e.stopPropagation()}>
            <div className="nav-handle" />
            
            <div className="nav-header">
              <h3>Menü</h3>
              <button onClick={() => setShowNav(false)} className="close-btn">✕</button>
            </div>

            <div className="nav-grid">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id as Page)}
                  className={`nav-item ${currentPage === item.id ? "active" : ""}`}
                >
                  <span className="nav-item-emoji">{item.emoji}</span>
                  <span className="nav-item-label">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="nav-footer">
              <button 
                onClick={toggleFocusMode}
                className={`focus-btn ${focusMode ? "active" : ""}`}
              >
                🎯 Focus Mod: {focusMode ? "Aktif" : "Pasif"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}