"use client";

import { useState } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import TaskList from "./components/TaskList";
import AmbientSounds from "./components/AmbientSounds";
import SiteBlocker from "./components/SiteBlocker";
import RewardSystem from "./components/RewardSystem";
import ThemeSelector from "./components/ThemeSelector";

type Page = "timer" | "tasks" | "sounds" | "blocker" | "rewards";

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  {
    id: "timer",
    label: "Timer",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "tasks",
    label: "Görevler",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: "sounds",
    label: "Sesler",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
  },
  {
    id: "blocker",
    label: "Engelle",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" />
      </svg>
    ),
  },
  {
    id: "rewards",
    label: "Ödüller",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-7-4-7 4l1.523-9.11" />
      </svg>
    ),
  },
];

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("timer");
  
  const renderPage = () => {
    switch (currentPage) {
      case "timer":
        return <PomodoroTimer />;
      case "tasks":
        return <TaskList />;
      case "sounds":
        return <AmbientSounds />;
      case "blocker":
        return <SiteBlocker />;
      case "rewards":
        return <RewardSystem />;
      default:
        return <PomodoroTimer />;
    }
  };
  
  const accent = "var(--theme-accent)";
  
  return (
    <div 
      className="h-screen w-full flex flex-col"
      style={{ backgroundColor: "var(--theme-bg)" }}
    >
      {/* Header */}
      <header 
        className="flex items-center justify-between px-4 pt-4"
        style={{ backgroundColor: "var(--theme-bg)" }}
      >
        <h1 className="text-lg font-semibold" style={{ color: "var(--theme-text)" }}>
          YaverFX
        </h1>
        <ThemeSelector />
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex items-center justify-center">
        {renderPage()}
      </main>
      
      {/* Bottom Navigation */}
      <nav 
        className="flex justify-around items-center px-2 pb-4"
        style={{ 
          backgroundColor: "var(--theme-secondary)",
          borderTop: "1px solid var(--theme-border)",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className="flex flex-col items-center justify-center py-2 px-3 min-w-44"
            style={{ 
              color: currentPage === item.id ? accent : "var(--theme-text)",
              opacity: currentPage === item.id ? 1 : 0.5,
            }}
          >
            <div className="mb-1">{item.icon}</div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}