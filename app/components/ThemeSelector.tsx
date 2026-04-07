"use client";

import { useState, useEffect } from "react";

type Theme = "modern" | "cyber" | "hacker" | "game" | "minimal";

const THEMES: { id: Theme; name: string; bg: string; accent: string }[] = [
  { id: "modern", name: "Modern", bg: "#09090b", accent: "#f43f5e" },
  { id: "cyber", name: "Cyber", bg: "#050510", accent: "#00f0ff" },
  { id: "hacker", name: "Hacker", bg: "#000000", accent: "#00ff00" },
  { id: "game", name: "Game", bg: "#0f0f1a", accent: "#ff6b35" },
  { id: "minimal", name: "Minimal", bg: "#ffffff", accent: "#2563eb" },
];

export default function ThemeSelector() {
  const [activeTheme, setActiveTheme] = useState<Theme>("modern");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("yaverfx-theme") as Theme;
    if (stored && THEMES.some(t => t.id === stored)) {
      setActiveTheme(stored);
      applyTheme(stored);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const t = THEMES.find(x => x.id === theme);
    if (!t) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("yaverfx-theme", theme);
  };

  const handleSelect = (theme: Theme) => {
    setActiveTheme(theme);
    applyTheme(theme);
    setShowPicker(false);
  };

  const current = THEMES.find(t => t.id === activeTheme);

  return (
    <div>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-11 h-11 flex items-center justify-center rounded-full min-h-44"
        style={{ backgroundColor: "var(--theme-secondary)" }}
      >
        <div 
          className="w-5 h-5 rounded-full" 
          style={{ backgroundColor: current?.accent }}
        />
      </button>

      {showPicker && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowPicker(false)}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div 
            className="w-full max-w-md rounded-t-3xl p-4 pb-8"
            onClick={e => e.stopPropagation()}
            style={{ 
              backgroundColor: "var(--theme-secondary)",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
            }}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: "var(--theme-border)" }} />
            
            <h3 className="text-center font-semibold mb-4" style={{ color: "var(--theme-text)" }}>
              Tema Seç
            </h3>

            <div className="grid grid-cols-5 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl"
                >
                  <div 
                    className={`w-12 h-12 rounded-full ${activeTheme === t.id ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: t.accent }}
                  />
                  <span className="text-xs" style={{ color: "var(--theme-text)" }}>{t.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPicker(false)}
              className="w-full py-3 rounded-xl font-medium mt-4 min-h-44"
              style={{ backgroundColor: "var(--theme-accent)", color: "#fff" }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
