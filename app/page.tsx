"use client";

import { useState, useEffect } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import TaskList from "./components/TaskList";
import AmbientSounds from "./components/AmbientSounds";
import SiteBlocker from "./components/SiteBlocker";
import RewardSystem from "./components/RewardSystem";
import ThemeSelector from "./components/ThemeSelector";

type Page = "home" | "tasks" | "sounds" | "blocker" | "rewards";

const TABS = [
  { id: "home", icon: "🏠", label: "Ana" },
  { id: "tasks", icon: "✅", label: "Görev" },
  { id: "sounds", icon: "🎵", label: "Ses" },
  { id: "blocker", icon: "🚫", label: "Blok" },
  { id: "rewards", icon: "🏆", label: "Ödül" },
] as const;

export default function Home() {
  const [page, setPage] = useState<Page>("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <HomeContent />;
      case "tasks": return <TaskList />;
      case "sounds": return <AmbientSounds />;
      case "blocker": return <SiteBlocker />;
      case "rewards": return <RewardSystem />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>YaverFX</h1>
        <div className="header-right">
          <ThemeSelector />
        </div>
      </header>

      <main className="main">
        {renderPage()}
      </main>

      <nav className="tabbar">
        {TABS.map(tab => (
          <button key={tab.id} className={`tab ${page === tab.id ? "active" : ""}`} onClick={() => setPage(tab.id as Page)}>
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-lbl">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function HomeContent() {
  return (
    <div>
      {/* Timer */}
      <div className="timer-card">
        <div className="timer-display">25:00</div>
        <div className="timer-status">Hazır</div>
        <div className="timer-actions">
          <button className="timer-btn start">▶ Başlat</button>
          <button className="timer-btn reset">↺ Sıfırla</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-box"><div className="stat-num">0</div><div className="stat-lbl">Dakika</div></div>
        <div className="stat-box"><div className="stat-num">0</div><div className="stat-lbl">Görev</div></div>
        <div className="stat-box"><div className="stat-num">0</div><div className="stat-lbl">Gün</div></div>
        <div className="stat-box"><div className="stat-num">0</div><div className="stat-lbl">Puan</div></div>
      </div>

      {/* Quick Task */}
      <div className="sect">
        <div className="sect-head"><span className="sect-title">Görevler</span></div>
        <div className="task-add-box">
          <input className="task-add-input" placeholder="Yeni görev ekle..." />
          <button className="task-add-btn">+</button>
        </div>
      </div>
    </div>
  );
}