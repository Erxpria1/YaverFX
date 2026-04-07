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

  return (
    <div className="relative">
      <button
        onClick={() => setShowThemes(!showThemes)}
        className="flex items-center gap-2 p-2 rounded-lg transition-colors"
        style={{ color: "var(--theme-accent)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      {showThemes && (
        <div className="absolute bottom-full right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl p-2 shadow-xl z-50">
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  activeTheme === theme.id
                    ? "ring-2 ring-white"
                    : "hover:bg-zinc-800"
                }`}
                style={{ backgroundColor: theme.colors.bg }}
                title={theme.name}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.secondary})`,
                  }}
                />
                <span className="text-[8px]" style={{ color: theme.colors.text }}>
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { applyTheme, THEMES };
