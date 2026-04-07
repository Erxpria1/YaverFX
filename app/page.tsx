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

const DEFAULT_STATS: Stats = { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };

const TABS = [
  { id: "timer", label: "Timer", icon: "⏱️" },
  { id: "tasks", label: "Görev", icon: "✅" },
  { id: "sounds", label: "Ses", icon: "🎵" },
  { id: "blocker", label: "Blok", icon: "🚫" },
  { id: "rewards", label: "Ödül", icon: "🏆" },
] as const;

export default function Home() {
  const [page, setPage] = useState<Page>("timer");
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const savedPage = localStorage.getItem("yaverfx-page") as Page;
    if (savedPage && TABS.find(t => t.id === savedPage)) setPage(savedPage);
    if (localStorage.getItem("yaverfx-focus-mode") === "true") setFocus(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("yaverfx-stats");
    if (stored) setStats({ ...DEFAULT_STATS, ...JSON.parse(stored) });
    const handler = () => {
      const s = localStorage.getItem("yaverfx-stats");
      if (s) setStats({ ...DEFAULT_STATS, ...JSON.parse(s) });
    };
    window.addEventListener("yaverfx-stats-update", handler);
    return () => window.removeEventListener("yaverfx-stats-update", handler);
  }, []);

  const go = (p: Page) => { setPage(p); localStorage.setItem("yaverfx-page", p); };
  const toggleFocus = () => { const n = !focus; setFocus(n); localStorage.setItem("yaverfx-focus-mode", String(n)); };

  return (
    <div className={`app ${focus ? "focus" : ""}`}>
      {focus && <div className="focus-bar"><span>🎯 Focus Modu</span><button onClick={toggleFocus}>✕</button></div>}
      
      <header className="header">
        <div className="header-content">
          <span className="page-icon">{TABS.find(t => t.id === page)?.icon}</span>
          <h1>{TABS.find(t => t.id === page)?.label}</h1>
        </div>
        <div className="header-actions">
          <button className={`focus-btn ${focus ? "active" : ""}`} onClick={toggleFocus}>🎯</button>
          <ThemeSelector />
        </div>
      </header>

      <main className="main">
        {page === "timer" && <PomodoroTimer />}
        {page === "tasks" && <TaskList />}
        {page === "sounds" && <AmbientSounds />}
        {page === "blocker" && <SiteBlocker />}
        {page === "rewards" && <RewardSystem />}
      </main>

      <nav className="tabbar">
        {TABS.map(t => (
          <button key={t.id} className={`tab ${page === t.id ? "active" : ""}`} onClick={() => go(t.id as Page)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}