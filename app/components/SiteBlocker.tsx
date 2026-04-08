"use client";

import { useState, useEffect } from "react";

export default function SiteBlocker() {
  const [sites, setSites] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("yaverfx-blocker-sites");
    const storedEnabled = localStorage.getItem("yaverfx-blocker-enabled");
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <div className="blocker-wrapper">
      <div className="blocker-header">
        <h2 className="section-title">Site Engelle</h2>
        <button
          onClick={toggleEnabled}
          className={`blocker-toggle ${enabled ? "active" : ""}`}
        >
          {enabled ? "✅ Aktif" : "⚠️ Pasif"}
        </button>
      </div>

      <div className="blocker-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Site adı (örn: twitter.com)"
          className="blocker-input"
        />
        <button onClick={addSite} className="blocker-add-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 5v10M5 10h10" />
          </svg>
        </button>
      </div>

      <div className="blocker-list">
        {sites.length === 0 ? (
          <div className="blocker-empty">Engellenen site yok</div>
        ) : (
          sites.map((site) => (
            <div key={site} className="blocker-item">
              <span className="blocker-item-text">{site}</span>
              <button onClick={() => removeSite(site)} className="blocker-delete">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}