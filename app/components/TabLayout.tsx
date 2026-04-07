"use client";

import { useState } from "react";
import TaskList from "./TaskList";
import AmbientSounds from "./AmbientSounds";
import SiteBlocker from "./SiteBlocker";
import RewardSystem from "./RewardSystem";

type Tab = "timer" | "tasks" | "sounds" | "blocker" | "rewards";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  {
    id: "tasks",
    label: "Görevler",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: "sounds",
    label: "Sesler",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
  },
  {
    id: "blocker",
    label: "Engelle",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" />
      </svg>
    ),
  },
  {
    id: "rewards",
    label: "Ödüller",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-7-4-7 4l1.523-9.11" />
      </svg>
    ),
  },
];

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("timer");
  const [isClosing, setIsClosing] = useState(false);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setActiveTab("timer");
      setIsClosing(false);
    }, 250);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "tasks":
        return <TaskList />;
      case "sounds":
        return <AmbientSounds />;
      case "blocker":
        return <SiteBlocker />;
      case "rewards":
        return <RewardSystem />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    return TABS.find((t) => t.id === activeTab)?.label || "";
  };

  return (
    <>
      {/* Bottom Tab Bar - Fixed with safe area */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 py-3 pb-safe"
        style={{ 
          backgroundColor: "var(--theme-secondary)",
          borderTop: "1px solid var(--theme-accent)",
          opacity: 0.95,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 touch-manipulation active:scale-95"
            style={{ 
              WebkitTapHighlightColor: "transparent",
              color: activeTab === tab.id ? "var(--theme-accent)" : "var(--theme-text)",
              opacity: activeTab === tab.id ? 1 : 0.6,
            }}
          >
            <div style={{ 
              color: activeTab === tab.id ? "var(--theme-accent)" : undefined,
              filter: activeTab === tab.id ? `drop-shadow(0 0 6px var(--theme-accent))` : "none"
            }}>
              {tab.icon}
            </div>
            <span className="text-[11px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Modal Overlay */}
      {activeTab !== "timer" && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center pb-safe"
          onClick={handleOverlayClick}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            animation: isClosing ? "fadeOut 0.2s ease-out" : "fadeIn 0.2s ease-out",
          }}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border-t p-4 pb-8 max-h-[75vh] overflow-y-auto"
            style={{ 
              backgroundColor: "var(--theme-secondary)",
              borderColor: "var(--theme-accent)",
              animation: isClosing ? "slideDown 0.25s ease-out" : "slideUp 0.3s ease-out",
              touchAction: "pan-y",
              WebkitOverflowScrolling: "touch",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-4 mt-2">
              <div 
                className="w-12 h-1.5 rounded-full" 
                style={{ backgroundColor: "var(--theme-accent)" }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: "var(--theme-text)" }}>
                {getTitle()}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full transition-colors active:scale-90"
                style={{ color: "var(--theme-text)", opacity: 0.7 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div style={{ animation: "contentAppear 0.3s ease-out" }}>
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
