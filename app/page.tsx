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

interface Stats { focusTime: number; tasksDone: number; streak: number; points: number; }
const EMPTY_STATS = { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);

  useEffect(() => {
    const stored = localStorage.getItem("yaverfx-stats");
    if (stored) setStats({ ...EMPTY_STATS, ...JSON.parse(stored) });
    
    const handleUpdate = () => {
      const s = localStorage.getItem("yaverfx-stats");
      if (s) setStats({ ...EMPTY_STATS, ...JSON.parse(s) });
    };
    window.addEventListener("yaverfx-stats-update", handleUpdate);
    return () => window.removeEventListener("yaverfx-stats-update", handleUpdate);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "home": return <HomeContent stats={stats} />;
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

function HomeContent({ stats }: { stats: Stats }) {
  return (
    <div>
      <PomodoroTimer />
      
      <div className="stats-grid">
        <div className="stat-box"><div className="stat-num">{Math.floor(stats.focusTime)}</div><div className="stat-lbl">Dakika</div></div>
        <div className="stat-box"><div className="stat-num">{stats.tasksDone}</div><div className="stat-lbl">Görev</div></div>
        <div className="stat-box"><div className="stat-num">{stats.streak}</div><div className="stat-lbl">Gün</div></div>
        <div className="stat-box"><div className="stat-num">{stats.points}</div><div className="stat-lbl">Puan</div></div>
      </div>

      <div className="sect">
        <div className="sect-head"><span className="sect-title">Görevler</span></div>
        <TaskList />
      </div>
    </div>
  );
}