"use client";

import { useState, useEffect } from "react";

type Theme = "modern" | "cyber" | "hacker" | "game" | "minimal";

const THEMES = [
  { id: "modern" as Theme, name: "Kırmızı", color: "#ff375f" },
  { id: "cyber" as Theme, name: "Mavi", color: "#64d2ff" },
  { id: "hacker" as Theme, name: "Yeşil", color: "#30d158" },
  { id: "game" as Theme, name: "Turuncu", color: "#ff9f0a" },
  { id: "minimal" as Theme, name: "Bleu", color: "#0a84ff" },
];

export default function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>("modern");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("yaverfx-theme") as Theme;
    if (t && THEMES.some(x => x.id === t)) setTheme(t);
  }, []);

  const apply = (t: Theme) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("yaverfx-theme", t);
    setShow(false);
  };

  const current = THEMES.find(t => t.id === theme);

  return (
    <>
      <button className="theme-btn" onClick={() => setShow(true)}>
        <span className="theme-dot" style={{ background: current?.color }} />
      </button>

      {show && (
        <div className="theme-sheet" onClick={() => setShow(false)}>
          <div className="theme-box" onClick={e => e.stopPropagation()}>
            <div className="theme-handle" />
            <div className="theme-grid">
              {THEMES.map(t => (
                <button key={t.id} className={`theme-opt ${theme === t.id ? "on" : ""}`} onClick={() => apply(t.id)}>
                  <span className="theme-opt-dot" style={{ background: t.color }} />
                  <span className="theme-opt-lbl">{t.name}</span>
                </button>
              ))}
            </div>
            <button className="theme-close" onClick={() => setShow(false)}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
}