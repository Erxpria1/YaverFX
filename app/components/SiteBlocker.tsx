"use client";

import { useState, useEffect } from "react";

export default function SiteBlocker() {
  const [sites, setSites] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("yaverfx-blocker-sites");
    const storedEnabled = localStorage.getItem("yaverfx-blocker-enabled");
    if (stored) setSites(JSON.parse(stored));
    if (storedEnabled) setEnabled(storedEnabled === "true");
  }, []);

  const addSite = () => {
    const trimmed = input.trim().replace(/^https?:\/\//, "").replace(/\/.*/, "");
    if (!trimmed || sites.includes(trimmed)) return;
    const newSites = [...sites, trimmed];
    setSites(newSites);
    localStorage.setItem("yaverfx-blocker-sites", JSON.stringify(newSites));
    setInput("");
  };

  const removeSite = (site: string) => {
    const newSites = sites.filter(s => s !== site);
    setSites(newSites);
    localStorage.setItem("yaverfx-blocker-sites", JSON.stringify(newSites));
  };

  const toggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    localStorage.setItem("yaverfx-blocker-enabled", String(newEnabled));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addSite();
  };

  const accent = "var(--theme-accent)";
  const text = "var(--theme-text)";
  const secondary = "var(--theme-secondary)";
  const border = "var(--theme-border)";

  return (
    <div className="flex flex-col gap-4 w-full px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: text }}>Site Engelle</h2>
        <button
          onClick={toggleEnabled}
          className="px-4 py-2 rounded-full text-sm font-medium min-h-44"
          style={{
            backgroundColor: enabled ? accent : secondary,
            color: enabled ? "#fff" : text,
            border: `1px solid ${border}`,
          }}
        >
          {enabled ? "Aktif" : "Kapalı"}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Site adresi..."
          className="flex-1 rounded-full px-4 py-3 text-base outline-none min-h-44"
          style={{ backgroundColor: secondary, border: `1px solid ${border}`, color: text }}
        />
        <button
          onClick={addSite}
          className="px-6 py-3 rounded-full font-semibold min-h-44"
          style={{ backgroundColor: accent, color: "#fff" }}
        >
          Ekle
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {sites.length === 0 && (
          <p className="text-center py-4" style={{ color: text, opacity: 0.5 }}>
            Engellenen site yok
          </p>
        )}
        {sites.map((site) => (
          <div
            key={site}
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: secondary, border: `1px solid ${border}` }}
          >
            <span className="text-sm" style={{ color: text }}>{site}</span>
            <button onClick={() => removeSite(site)} className="p-2 min-h-44 min-w-44" style={{ color: text, opacity: 0.5 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
