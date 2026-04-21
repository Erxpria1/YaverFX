"use client";

import { useState, useCallback } from "react";
import { Bell, BellRing, MousePointerClick, Volume2, VolumeX, Check, RefreshCw } from "lucide-react";
import { playPixelClick, playPixelCoin, playPixelComplete, playPixelStart } from "../utils/pixelSound";

const SOUND_STORAGE_KEY = "yaverfx-sounds";
const STORAGE_KEY_INTERVAL = "yaverfx-task-notify-hours";

interface SoundSettings {
  clickEnabled: boolean;
  notifEnabled: boolean;
  volume: number;
  notifyHours?: number;
}

const defaults: SoundSettings = {
  clickEnabled: true,
  notifEnabled: true,
  volume: 0.8,
  notifyHours: 12,
};

function loadSoundSettings(): SoundSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const s = localStorage.getItem(SOUND_STORAGE_KEY);
    return s ? { ...defaults, ...JSON.parse(s) } : defaults;
  } catch {
    return defaults;
  }
}

function saveSoundSettings(s: SoundSettings) {
  localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(s));
}

export function playUISound(type: "click" | "coin" | "complete" | "start") {
  try {
    const settings = loadSoundSettings();
    if (!settings.clickEnabled && type !== "complete") return;
    const vol = settings.volume * 0.6;
    switch (type) {
      case "click": playPixelClick(vol); break;
      case "coin": playPixelCoin(vol); break;
      case "complete": playPixelComplete(settings.volume * 0.8); break;
      case "start": playPixelStart(settings.volume * 0.8); break;
    }
  } catch {}
}

export default function SoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>(loadSoundSettings);

  const [notifyHours, setNotifyHours] = useState(() => {
    if (typeof window === "undefined") return 12;
    const stored = localStorage.getItem(STORAGE_KEY_INTERVAL);
    return stored ? parseFloat(stored) : 12;
  });

  // Pick a random incomplete task
  const tryPickFeaturedTask = useCallback(() => {
    const STORAGE_KEY_TASKS = "yaverfx-tasks";
    const stored = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!stored) return;
    try {
      const tasks = JSON.parse(stored);
      if (!Array.isArray(tasks)) return;
      const incomplete = tasks.filter((t: { completed: boolean }) => !t.completed);
      if (incomplete.length === 0) return;
      const lastPick = localStorage.getItem("yaverfx-task-last-pick");
      const intervalMs = (settings.notifyHours ?? 12) * 60 * 60 * 1000;
      if (!lastPick || Date.now() - parseInt(lastPick) > intervalMs) {
        const pick = incomplete[Math.floor(Math.random() * incomplete.length)];
        localStorage.setItem("yaverfx-task-last-pick", String(Date.now()));
        window.dispatchEvent(new CustomEvent("yaverfx-feature-pick", { detail: pick }));
      }
    } catch {}
  }, [settings.notifyHours]);

  const update = useCallback((patch: Partial<SoundSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSoundSettings(next);
    if (patch.notifyHours !== undefined) {
      setNotifyHours(patch.notifyHours);
      localStorage.setItem(STORAGE_KEY_INTERVAL, String(patch.notifyHours));
    }
  }, [settings]);

  const previewClick = () => {
    if (settings.clickEnabled) playPixelClick(settings.volume * 0.6);
  };

  const previewNotif = () => {
    if (settings.notifEnabled) playPixelComplete(settings.volume * 0.8);
  };

  return (
    <div className="sounds-wrapper animate-in">
      <div className="theme-list">

        {/* Tiklama Sesleri */}
        <div className="sound-card">
          <div className="sound-header">
            <div className="sound-icon-wrap">
              <MousePointerClick size={20} />
            </div>
            <div className="sound-info">
              <span className="theme-name">Tiklama Sesleri</span>
              <span className="theme-desc">
                {settings.clickEnabled ? "Aktif" : "Kapali"}
              </span>
            </div>
            <button
              onClick={() => {
                update({ clickEnabled: !settings.clickEnabled });
                if (!settings.clickEnabled) playPixelClick(settings.volume * 0.6);
              }}
              className={`toggle-btn ${settings.clickEnabled ? "on" : "off"}`}
            >
              {settings.clickEnabled ? <Bell size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
          {settings.clickEnabled && (
            <button onClick={previewClick} className="preview-btn">
              <Check size={14} />
              <span>Test Et</span>
            </button>
          )}
        </div>

        {/* Bildirim Sesleri */}
        <div className="sound-card">
          <div className="sound-header">
            <div className="sound-icon-wrap">
              <Bell size={20} />
            </div>
            <div className="sound-info">
              <span className="theme-name">Bildirim Sesleri</span>
              <span className="theme-desc">
                {settings.notifEnabled ? "Aktif" : "Kapali"}
              </span>
            </div>
            <button
              onClick={() => {
                update({ notifEnabled: !settings.notifEnabled });
                if (!settings.notifEnabled) playPixelComplete(settings.volume * 0.8);
              }}
              className={`toggle-btn ${settings.notifEnabled ? "on" : "off"}`}
            >
              {settings.notifEnabled ? <Bell size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
          {settings.notifEnabled && (
            <button onClick={previewNotif} className="preview-btn">
              <Check size={14} />
              <span>Test Et</span>
            </button>
          )}
        </div>

        {/* Ses Seviyesi */}
        <div className="sound-card">
          <div className="sound-header">
            <div className="sound-icon-wrap">
              <Volume2 size={20} />
            </div>
            <div className="sound-info">
              <span className="theme-name">Ses Seviyesi</span>
              <span className="theme-desc">{Math.round(settings.volume * 100)}%</span>
            </div>
          </div>
          <div className="volume-slider-wrap">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => update({ volume: parseFloat(e.target.value) })}
              className="volume-slider"
            />
          </div>
        </div>

        {/* Gorev Hatirlatma Araligi */}
        <div className="sound-card">
          <div className="sound-header">
            <div className="sound-icon-wrap">
              <BellRing size={20} />
            </div>
            <div className="sound-info">
              <span className="theme-name">Gorev Hatirlatma</span>
              <span className="theme-desc">Her {notifyHours} saatte bir rastgele gorev gosterir</span>
            </div>
          </div>
          <div className="notify-hours-grid">
            {([1, 3, 6, 12, 24] as const).map((h) => (
              <button
                key={h}
                onClick={() => {
                  update({ notifyHours: h });
                  if (settings.notifEnabled) playPixelComplete(settings.volume * 0.8);
                }}
                className={`notify-hour-btn ${notifyHours === h ? "active" : ""}`}
              >
                {h}s
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (settings.notifEnabled) playPixelComplete(settings.volume * 0.8);
              tryPickFeaturedTask();
            }}
            className="preview-btn"
            style={{ marginTop: "6px" }}
          >
            <RefreshCw size={14} />
            <span>Simdi Bir Gorev Sec</span>
          </button>
        </div>

      </div>
    </div>
  );
}
