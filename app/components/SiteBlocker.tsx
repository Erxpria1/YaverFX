"use client";

import { useState, useEffect } from "react";

interface BlockedSite {
  id: string;
  domain: string;
}

export default function SiteBlocker() {
  const [input, setInput] = useState("");
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("blockedSites");
    const enabled = localStorage.getItem("siteBlockerEnabled");
    if (saved) setBlockedSites(JSON.parse(saved));
    if (enabled) setIsEnabled(JSON.parse(enabled));
  }, []);

  useEffect(() => {
    localStorage.setItem("blockedSites", JSON.stringify(blockedSites));
  }, [blockedSites]);

  useEffect(() => {
    localStorage.setItem("siteBlockerEnabled", JSON.stringify(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      setIsBlocked(false);
      return;
    }

    const checkBlocked = () => {
      const currentDomain = window.location.hostname;
      const match = blockedSites.some(
        (site) => currentDomain === site.domain || currentDomain.endsWith(`.${site.domain}`)
      );
      setIsBlocked(match);
    };

    checkBlocked();
    const interval = setInterval(checkBlocked, 1000);
    return () => clearInterval(interval);
  }, [isEnabled, blockedSites]);

  const addSite = () => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;
    const domain = trimmed.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (blockedSites.some((s) => s.domain === domain)) {
      setInput("");
      return;
    }
    setBlockedSites((prev) => [...prev, { id: crypto.randomUUID(), domain }]);
    setInput("");
  };

  const removeSite = (id: string) => {
    setBlockedSites((prev) => prev.filter((s) => s.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addSite();
  };

  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 rounded-xl border border-rose-900/50 bg-zinc-900 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8 text-rose-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Site Blocked</h2>
            <p className="mt-2 text-sm text-zinc-400">This site is on your block list. Stay focused!</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="rounded-full bg-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Site Blocker</h2>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isEnabled ? "bg-rose-500" : "bg-zinc-700"
          }`}
          aria-label={isEnabled ? "Disable site blocker" : "Enable site blocker"}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter domain to block..."
          className="flex-1 rounded-full bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500"
        />
        <button
          onClick={addSite}
          className="rounded-full bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
        >
          Add
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {blockedSites.length === 0 && (
          <p className="text-center text-sm text-zinc-500 py-4">
            No blocked sites. Add one above!
          </p>
        )}
        {blockedSites.map((site) => (
          <div
            key={site.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:border-zinc-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 shrink-0 text-zinc-500"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span className="flex-1 text-sm text-zinc-100">{site.domain}</span>
            <button
              onClick={() => removeSite(site.id)}
              className="shrink-0 rounded p-1 text-zinc-500 transition-colors hover:text-rose-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
