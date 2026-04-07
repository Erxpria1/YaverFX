"use client";

import { useState, useEffect } from "react";

type Theme = "modern" | "cyber" | "hacker" | "game" | "minimal";

interface ThemeConfig {
  id: Theme;
  name: string;
  colors: {
    bg: string;
    text: string;
    accent: string;
    secondary: string;
  };
}

const THEMES: ThemeConfig[] = [
  {
    id: "modern",
    name: "Modern",
    colors: {
      bg: "#09090b",
      text: "#fafafa",
      accent: "#f43f5e",
      secondary: "#27272a",
    },
  },
  {
    id: "cyber",
    name: "Cyber",
    colors: {
      bg: "#0a0a1a",
      text: "#e0f7fa",
      accent: "#00fff0",
      secondary: "#1a0a2e",
    },
  },
  {
    id: "hacker",
    name: "Hacker",
    colors: {
      bg: "#000000",
      text: "#00ff00",
      accent: "#00ff00",
      secondary: "#0d1a0d",
    },
  },
  {
    id: "game",
    name: "Game",
    colors: {
      bg: "#1a1a2e",
      text: "#fff",
      accent: "#ff6b35",
      secondary: "#16213e",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    colors: {
      bg: "#ffffff",
      text: "#1a1a1a",
      accent: "#2563eb",
      secondary: "#f3f4f6",
    },
  },
];

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "modern";
  const stored = localStorage.getItem("yaverfx-theme");
  if (stored && THEMES.some((t) => t.id === stored)) {
    return stored as Theme;
  }
  return "modern";
}

function applyTheme(theme: Theme) {
  const config = THEMES.find((t) => t.id === theme);
  if (!config || typeof window === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--theme-bg", config.colors.bg);
  root.style.setProperty("--theme-text", config.colors.text);
  root.style.setProperty("--theme-accent", config.colors.accent);
  root.style.setProperty("--theme-secondary", config.colors.secondary);
  root.setAttribute("data-theme", theme);
  
  localStorage.setItem("yaverfx-theme", theme);
}

export default function ThemeSelector() {
  const [activeTheme, setActiveTheme] = useState<Theme>("modern");
  const [showThemes, setShowThemes] = useState(false);

  useEffect(() => {
    const theme = getStoredTheme();
    setActiveTheme(theme);
    applyTheme(theme);
  }, []);

  const handleThemeChange = (theme: Theme) => {
    setActiveTheme(theme);
    applyTheme(theme);
    setShowThemes(false);
  };

  // Get current theme's accent color
  const currentTheme = THEMES.find(t => t.id === activeTheme);
  const accentColor = currentTheme?.colors.accent || "#f43f5e";

  return (
    <div className="relative">
      <button
        onClick={() => setShowThemes(!showThemes)}
        className="flex items-center justify-center w-12 h-12 rounded-full transition-all touch-manipulation"
        style={{ 
          backgroundColor: "var(--theme-secondary)",
          color: accentColor,
        }}
        aria-label="Tema değiştir"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      {showThemes && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center pb-24"
          onClick={() => setShowThemes(false)}
        >
          <div 
            className="w-full max-w-md bg-[var(--theme-secondary)] border-t border-zinc-700 rounded-t-2xl p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1.5 bg-zinc-600 rounded-full" />
            </div>

            <h3 className="text-lg font-semibold text-center mb-4" style={{ color: "var(--theme-text)" }}>
              Tema Seç
            </h3>

            <div className="grid grid-cols-5 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all touch-manipulation ${
                    activeTheme === theme.id
                      ? "ring-2 ring-white"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ 
                    backgroundColor: theme.colors.bg,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.secondary} 100%)`,
                      boxShadow: activeTheme === theme.id 
                        ? `0 0 15px ${theme.colors.accent}80` 
                        : 'none'
                    }}
                  />
                  <span className="text-xs font-medium" style={{ color: theme.colors.text }}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowThemes(false)}
              className="w-full mt-4 py-3 rounded-xl font-medium transition-colors"
              style={{ 
                backgroundColor: "var(--theme-accent)",
                color: "#fff"
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { applyTheme, THEMES };
