"use client";

import { useState, useEffect } from "react";

type Theme = "modern" | "cyber" | "hacker" | "game" | "minimal";

const THEMES: { id: Theme; name: string; color: string }[] = [
  { id: "modern", name: "Modern", color: "#f43f5e" },
  { id: "cyber", name: "Cyber", color: "#00f0ff" },
  { id: "hacker", name: "Hacker", color: "#00ff00" },
  { id: "game", name: "Game", color: "#ff6b35" },
  { id: "minimal", name: "Minimal", color: "#2563eb" },
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
    <>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="theme-trigger"
      >
        <div 
          className="theme-dot" 
          style={{ backgroundColor: current?.color }}
        />
      </button>

      {showPicker && (
        <div className="theme-overlay" onClick={() => setShowPicker(false)}>
          <div className="theme-modal" onClick={e => e.stopPropagation()}>
            <div className="theme-handle" />
            
            <h3 className="theme-modal-title">Tema Seç</h3>

            <div className="theme-grid">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`theme-option ${activeTheme === t.id ? "active" : ""}`}
                >
                  <div 
                    className="theme-option-dot"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="theme-option-label">{t.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPicker(false)}
              className="theme-close-btn"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}