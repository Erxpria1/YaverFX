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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: "sounds",
    label: "Sesler",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
  },
  {
    id: "blocker",
    label: "Engelle",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" />
      </svg>
    ),
  },
  {
    id: "rewards",
    label: "Ödüller",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    }, 200);
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
      {/* Bottom Tab Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-2 py-2 pb-safe z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors touch-manipulation ${
                activeTab === tab.id
                  ? "text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div className={activeTab === tab.id ? "text-rose-400" : ""}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal Overlay */}
      {activeTab !== "timer" && (
        <div
          className={`fixed inset-0 bg-black/60 z-40 flex items-end justify-center pb-20 ${
            isClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          onClick={handleOverlayClick}
          style={{
            animation: isClosing ? "fadeOut 0.2s ease-out" : "fadeIn 0.2s ease-out",
          }}
        >
          <div
            className={`bg-zinc-900 w-full max-w-md rounded-t-2xl border-t border-zinc-800 p-4 pb-8 max-h-[70vh] overflow-y-auto ${
              isClosing ? "animate-slide-down" : "animate-slide-up"
            }`}
            style={{
              animation: isClosing ? "slideDown 0.2s ease-out" : "slideUp 0.3s ease-out",
              touchAction: "pan-y",
              WebkitOverflowScrolling: "touch",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">{getTitle()}</h2>
              <button
                onClick={closeModal}
                className="p-2 text-zinc-500 hover:text-zinc-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="animate-content-appear">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
