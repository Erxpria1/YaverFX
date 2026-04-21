"use client";

import { useState, useEffect } from "react";

type Theme = "modern" | "cyber" | "minimal" | "pixel";

const THEMES: { id: Theme; name: string; color: string; desc: string }[] = [
  { id: "modern", name: "Kirmizi", color: "#ff375f", desc: "Klasik Yaver" },
  { id: "cyber", name: "Cyber", color: "#64d2ff", desc: "Gelecek Odak" },
  { id: "minimal", name: "Minimal", color: "#0a84ff", desc: "Sakin Yalin" },
  { id: "pixel", name: "Pixel", color: "#ff2e63", desc: "8-bit Retro" },
];

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<Theme>("modern");

  useEffect(() => {
    const t = localStorage.getItem("yaverfx-theme") as Theme;
    if (t && THEMES.some(x => x.id === t)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentTheme(t);
      document.documentElement.setAttribute("data-theme", t);
    }
     
  }, []);

  const applyTheme = (t: Theme) => {
    setCurrentTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("yaverfx-theme", t);
  };

  return (
    <div className="theme-wrapper">
      <div className="theme-list">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => applyTheme(t.id)}
            className={`theme-card ${currentTheme === t.id ? "active" : ""}`}
          >
            <div className="theme-preview" style={{ background: t.color }}>
              {currentTheme === t.id && <span className="theme-check">✓</span>}
            </div>
            <div className="theme-info">
              <span className="theme-name">{t.name}</span>
              <span className="theme-desc">{t.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
