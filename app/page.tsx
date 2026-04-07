"use client";

import { useState, useEffect, useCallback } from "react";

// PWA için viewport height
function useViewportHeight() {
  const [height, setHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 700
  );

  useEffect(() => {
    const updateHeight = () => {
      // iOS Safari için dynamic viewport height
      const vh = window.innerHeight;
      // Fallback için visualViewport kullan
      if (window.visualViewport) {
        setHeight(vh);
      } else {
        setHeight(vh);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateHeight);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateHeight);
      }
    };
  }, []);

  return height;
}

export default function Home() {
  const viewportHeight = useViewportHeight();
  const [currentPage, setCurrentPage] = useState<string>("timer");
  
  // Lazy load components
  const [TimerComponent, setTimerComponent] = useState<React.ComponentType | null>(null);
  const [TasksComponent, setTasksComponent] = useState<React.ComponentType | null>(null);
  const [SoundsComponent, setSoundsComponent] = useState<React.ComponentType | null>(null);
  const [BlockerComponent, setBlockerComponent] = useState<React.ComponentType | null>(null);
  const [RewardsComponent, setRewardsComponent] = useState<React.ComponentType | null>(null);
  const [ThemeComponent, setThemeComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import("./components/PomodoroTimer").then(m => setTimerComponent(() => m.default));
    import("./components/TaskList").then(m => setTasksComponent(() => m.default));
    import("./components/AmbientSounds").then(m => setSoundsComponent(() => m.default));
    import("./components/SiteBlocker").then(m => setBlockerComponent(() => m.default));
    import("./components/RewardSystem").then(m => setRewardsComponent(() => m.default));
    import("./components/ThemeSelector").then(m => setThemeComponent(() => m.default));
  }, []);

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case "timer": return TimerComponent ? <TimerComponent /> : null;
      case "tasks": return TasksComponent ? <TasksComponent /> : null;
      case "sounds": return SoundsComponent ? <SoundsComponent /> : null;
      case "blocker": return BlockerComponent ? <BlockerComponent /> : null;
      case "rewards": return RewardsComponent ? <RewardsComponent /> : null;
      default: return TimerComponent ? <TimerComponent /> : null;
    }
  }, [currentPage, TimerComponent, TasksComponent, SoundsComponent, BlockerComponent, RewardsComponent]);

  const pages = [
    { id: "timer", label: "Timer", icon: "⏱️" },
    { id: "tasks", label: "Görevler", icon: "📋" },
    { id: "sounds", label: "Sesler", icon: "🔊" },
    { id: "blocker", label: "Engelle", icon: "🚫" },
    { id: "rewards", label: "Ödüller", icon: "🏆" },
  ];

  const accent = "var(--theme-accent)";
  const text = "var(--theme-text)";
  const secondary = "var(--theme-secondary)";
  const border = "var(--theme-border)";

  return (
    <div 
      style={{ 
        height: `${viewportHeight}px`,
        backgroundColor: "var(--theme-bg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header - iOS safe area aware */}
      <header 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "12px 16px",
          paddingTop: "max(12px, env(safe-area-inset-top))",
          backgroundColor: "var(--theme-bg)",
        }}
      >
        <h1 style={{ fontSize: "18px", fontWeight: "600", color: text }}>
          YaverFX
        </h1>
        {ThemeComponent && <ThemeComponent />}
      </header>
      
      {/* Main Content - scrollable area */}
      <main style={{ 
        flex: 1, 
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}>
        {renderPage()}
      </main>
      
      {/* Bottom Navigation - iOS safe area aware */}
      <nav 
        style={{ 
          display: "flex", 
          justifyContent: "space-around", 
          alignItems: "center",
          padding: "8px 8px",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          backgroundColor: secondary,
          borderTop: `1px solid ${border}`,
        }}
      >
        {pages.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center",
              padding: "8px 12px",
              minHeight: "44px",
              minWidth: "44px",
              background: "transparent",
              border: "none",
              color: currentPage === item.id ? accent : text,
              opacity: currentPage === item.id ? 1 : 0.5,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "20px", marginBottom: "4px" }}>{item.icon}</span>
            <span style={{ fontSize: "10px", fontWeight: "500" }}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}