"use client";

import { useState, useCallback } from "react";
import { Volume2, VolumeX, Bell, MousePointerClick, Check } from "lucide-react";
import { playPixelClick, playPixelCoin, playPixelComplete, playPixelStart } from "../utils/pixelSound";

const SOUND_STORAGE_KEY = "yaverfx-sounds";

interface SoundSettings {
  clickEnabled: boolean;
  notifEnabled: boolean;
  volume: number;
}

const defaults: SoundSettings = {
  clickEnabled: true,
  notifEnabled: true,
  volume: 0.8,
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

// Preview functions that respect the settings
export function playUISound(type: "click" | "coin" | "complete" | "start") {
  try {
    const settings = loadSoundSettings();
    if (!settings.clickEnabled && type !== "complete") return;

    const vol = settings.volume * 0.6;
    switch (type) {
      case "click":
        playPixelClick(vol);
        break;
      case "coin":
        playPixelCoin(vol);
        break;
      case "complete":
        playPixelComplete(settings.volume * 0.8);
        break;
      case "start":
        playPixelStart(settings.volume * 0.8);
        break;
    }
  } catch {}
}

export default function SoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>(loadSoundSettings);

  const update = useCallback((patch: Partial<SoundSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSoundSettings(next);
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
        {/* Click Sounds */}
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

        {/* Notification Sounds */}
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

        {/* Volume */}
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
      </div>
    </div>
  );
}
