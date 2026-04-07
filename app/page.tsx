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
const EMPTY = { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [stats, setStats] = useState<Stats>(EMPTY);

  useEffect(() => {
    const s = localStorage.getItem("yaverfx-stats");
    if (s) setStats({ ...EMPTY, ...JSON.parse(s) });
    const listener = () => {
      const x = localStorage.getItem("yaverfx-stats");
      if (x) setStats({ ...EMPTY, ...JSON.parse(x) });
    };
    window.addEventListener("yaverfx-stats-update", listener);
    return () => window.removeEventListener("yaverfx-stats-update", listener);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">YaverFX</h1>
        <div className="header-right">
          <ThemeSelector />
        </div>
      </header>

      <main className="main">
        {page === "home" && <HomePage stats={stats} />}
        {page === "tasks" && <TaskList />}
        {page === "sounds" && <AmbientSounds />}
        {page === "blocker" && <SiteBlocker />}
        {page === "rewards" && <RewardSystem />}
      </main>

      <nav className="tabbar">
        {TABS.map(t => (
          <button key={t.id} className={`tab ${page === t.id ? "active" : ""}`} onClick={() => setPage(t.id as Page)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function HomePage({ stats }: { stats: Stats }) {
  return (
    <div>
      <div className="section">
        <div className="timer-hero">
          <div className="timer-time">25:00</div>
          <div className="timer-label">Hazır</div>
          <div className="timer-btns">
            <button className="timer-btn primary">Başlat</button>
            <button className="timer-btn secondary">Sıfırla</button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{stats.focusTime}</div>
            <div className="stat-label">Dakika</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.tasksDone}</div>
            <div className="stat-label">Görev</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.streak}</div>
            <div className="stat-label">Gün</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.points}</div>
            <div className="stat-label">Puan</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <span className="section-title">Hızlı Görev</span>
        </div>
        <div className="task-card">
          <div className="task-input-row">
            <input className="task-input" placeholder="Yeni görev ekle..." />
            <button className="task-add">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}