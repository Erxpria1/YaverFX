"use client";

import { useState, useEffect } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import TaskList from "./components/TaskList";
import AmbientSounds from "./components/AmbientSounds";
import SiteBlocker from "./components/SiteBlocker";
import RewardSystem from "./components/RewardSystem";
import ThemeSelector from "./components/ThemeSelector";
import EmergencyTimer from "./components/EmergencyTimer";
import Analytics from "./components/Analytics";
import { getAppName } from "./context/TimerContext";

type Page = "home" | "tasks" | "sounds" | "blocker" | "rewards" | "theme" | "emergency" | "analytics";

const MENU_ITEMS = [
  { id: "home", icon: "🏠", label: "Ana Ekran" },
  { id: "tasks", icon: "✅", label: "Görevler" },
  { id: "sounds", icon: "🎵", label: "Odak Sesleri" },
  { id: "blocker", icon: "🚫", label: "Engelleyici" },
  { id: "rewards", icon: "🏆", label: "Başarılar" },
  { id: "theme", icon: "🎨", label: "Tema Seç" },
  { id: "emergency", icon: "🛑", label: "Acil Durakla" },
  { id: "analytics", icon: "📊", label: "Analitik" },
] as const;

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [appName, setAppName] = useState(getAppName());

  useEffect(() => {
    const updateName = () => setAppName(getAppName());
    updateName();
    window.addEventListener("yaverfx-name-update", updateName);
    return () => window.removeEventListener("yaverfx-name-update", updateName);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "home": return <PomodoroTimer />;
      case "tasks": return <div className="page-container animate-in"><h2 className="page-title">Görevler</h2><TaskList /></div>;
      case "sounds": return <div className="page-container animate-in"><h2 className="page-title">Sesler</h2><AmbientSounds /></div>;
      case "blocker": return <div className="page-container animate-in"><h2 className="page-title">Engelleyici</h2><SiteBlocker /></div>;
      case "rewards": return <div className="page-container animate-in"><h2 className="page-title">Ödüller</h2><RewardSystem /></div>;
      case "theme": return <div className="page-container animate-in"><h2 className="page-title">Görünüm</h2><ThemeSelector /></div>;
      case "emergency": return <div className="page-container animate-in"><h2 className="page-title">Acil Duraklama</h2><EmergencyTimer /></div>;
      case "analytics": return <div className="page-container animate-in"><h2 className="page-title">Analitik</h2><Analytics /></div>;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo-dot"></span>
          <h1>{appName}</h1>
        </div>
      </header>

      <main className="main-stage">
        {renderPage()}
      </main>

      <div className={`menu-overlay ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(false)}>
        <div className="menu-content" onClick={e => e.stopPropagation()}>
          <div className="menu-grid">
            {MENU_ITEMS.map(item => (
              <button 
                key={item.id} 
                className={`menu-item ${page === item.id ? "active" : ""}`}
                onClick={() => { setPage(item.id as Page); setIsMenuOpen(false); }}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className={`fab-main ${isMenuOpen ? "open" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <span className="fab-icon">{isMenuOpen ? "✕" : "☰"}</span>
      </button>
    </div>
  );
}