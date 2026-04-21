"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Clock, 
  Coffee, 
  Repeat, 
  Timer, 
  PlayCircle, 
  BellRing, 
  Save, 
  RotateCcw,
  Check
} from "lucide-react";
import { getSettings, saveSettings } from "../context/TimerContext";
import { DEFAULT_SETTINGS } from "../context/TimerContext";
import { playPixelClick, playPixelComplete } from "../utils/pixelSound";

// Default values in minutes for UI
const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_SHORT_BREAK_MINUTES = 5;
const DEFAULT_LONG_BREAK_MINUTES = 15;
const DEFAULT_POMODOROS_UNTIL_LONG = 4;

const SOUND_STORAGE_KEY = "yaverfx-sounds";

interface SoundSettings {
  clickEnabled: boolean;
  notifEnabled: boolean;
  volume: number;
}

function loadSoundSettings(): SoundSettings {
  if (typeof window === "undefined") {
    return { clickEnabled: true, notifEnabled: true, volume: 0.8 };
  }
  try {
    const s = localStorage.getItem(SOUND_STORAGE_KEY);
    return s ? JSON.parse(s) : { clickEnabled: true, notifEnabled: true, volume: 0.8 };
  } catch {
    return { clickEnabled: true, notifEnabled: true, volume: 0.8 };
  }
}

function saveSoundSettings(s: SoundSettings) {
  localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(s));
}

interface SettingsState {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notificationSounds: boolean;
}

const DEFAULT_STATE: SettingsState = {
  workDuration: DEFAULT_WORK_MINUTES,
  shortBreakDuration: DEFAULT_SHORT_BREAK_MINUTES,
  longBreakDuration: DEFAULT_LONG_BREAK_MINUTES,
  sessionsBeforeLongBreak: DEFAULT_POMODOROS_UNTIL_LONG,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  notificationSounds: true,
};

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [soundSettings, setSoundSettings] = useState<SoundSettings>({
    clickEnabled: true,
    notifEnabled: true,
    volume: 0.8,
  });

  // Load settings on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load timer settings
    const timerSettings = getSettings();
    setSettings({
      workDuration: Math.round(timerSettings.workDuration / 60),
      shortBreakDuration: Math.round(timerSettings.shortBreakDuration / 60),
      longBreakDuration: Math.round(timerSettings.longBreakDuration / 60),
      sessionsBeforeLongBreak: timerSettings.sessionsBeforeLongBreak,
      autoStartBreaks: false, // These need separate storage
      autoStartPomodoros: false,
      notificationSounds: true,
    });

    // Load sound settings
    const loadedSoundSettings = loadSoundSettings();
    setSoundSettings(loadedSoundSettings);

    // Load auto-start preferences
    try {
      const autoStartBreaks = localStorage.getItem("yaverfx-auto-start-breaks");
      const autoStartPomodoros = localStorage.getItem("yaverfx-auto-start-pomodoros");
      const notifSounds = localStorage.getItem("yaverfx-notification-sounds");

      setSettings(prev => ({
        ...prev,
        autoStartBreaks: autoStartBreaks === "true",
        autoStartPomodoros: autoStartPomodoros === "true",
        notificationSounds: notifSounds !== "false", // default true
      }));
    } catch {}

    setIsLoaded(true);
  }, []);

  // Play click sound on interaction
  const playClick = useCallback(() => {
    if (soundSettings.clickEnabled) {
      playPixelClick(soundSettings.volume * 0.6);
    }
  }, [soundSettings]);

  // Play completion sound
  const playComplete = useCallback(() => {
    if (soundSettings.notifEnabled) {
      playPixelComplete(soundSettings.volume * 0.8);
    }
  }, [soundSettings]);

  // Update a setting and persist immediately
  const updateSetting = useCallback(<K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    playClick();
    setSettings(prev => ({ ...prev, [key]: value }));

    // Persist to localStorage immediately
    if (key === "autoStartBreaks") {
      localStorage.setItem("yaverfx-auto-start-breaks", String(value));
    } else if (key === "autoStartPomodoros") {
      localStorage.setItem("yaverfx-auto-start-pomodoros", String(value));
    } else if (key === "notificationSounds") {
      localStorage.setItem("yaverfx-notification-sounds", String(value));
    }

    // Clear saved indicator
    setSaved(false);
  }, [playClick]);

  // Save all timer settings to TimerContext format
  const handleSave = useCallback(() => {
    playComplete();
    
    // Save timer duration settings
    saveSettings({
      workDuration: settings.workDuration * 60,
      shortBreakDuration: settings.shortBreakDuration * 60,
      longBreakDuration: settings.longBreakDuration * 60,
      sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
    });

    // Show saved indicator
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Dispatch event to notify timer of settings change
    window.dispatchEvent(new CustomEvent("yaverfx-settings-updated"));
  }, [settings, playComplete]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    playClick();
    
    setSettings(DEFAULT_STATE);
    
    // Reset localStorage
    localStorage.setItem("yaverfx-auto-start-breaks", "false");
    localStorage.setItem("yaverfx-auto-start-pomodoros", "false");
    localStorage.setItem("yaverfx-notification-sounds", "true");
    
    // Reset TimerContext settings
    saveSettings({
      workDuration: DEFAULT_SETTINGS.workDuration,
      shortBreakDuration: DEFAULT_SETTINGS.shortBreakDuration,
      longBreakDuration: DEFAULT_SETTINGS.longBreakDuration,
      sessionsBeforeLongBreak: DEFAULT_SETTINGS.sessionsBeforeLongBreak,
    });

    // Dispatch event
    window.dispatchEvent(new CustomEvent("yaverfx-settings-updated"));
    
    setSaved(false);
  }, [playClick]);

  if (!isLoaded) {
    return (
      <div className="settings-wrapper animate-in">
        <div className="settings-loading">Ayarlar yukleniyor...</div>
      </div>
    );
  }

  return (
    <div className="settings-wrapper animate-in">
      <div className="settings-header">
        <h2 className="settings-title">Zamanlayici Ayarlari</h2>
        <p className="settings-subtitle">Odak seanslarini ozellestir</p>
      </div>

      <div className="settings-list">
        {/* Work Duration */}
        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon-wrap">
              <Clock size={20} />
            </div>
            <div className="setting-info">
              <span className="setting-name">Calisma Suresi</span>
              <span className="setting-desc">Odaklanma seansinin uzunlugu</span>
            </div>
            <div className="setting-value">
              <input
                type="number"
                min="1"
                max="90"
                value={settings.workDuration}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(90, parseInt(e.target.value) || 1));
                  updateSetting("workDuration", val);
                }}
                className="setting-number-input"
              />
              <span className="setting-unit">dk</span>
            </div>
          </div>
          <div className="setting-slider-wrap">
            <input
              type="range"
              min="1"
              max="90"
              value={settings.workDuration}
              onChange={(e) => updateSetting("workDuration", parseInt(e.target.value))}
              className="setting-slider"
              style={{ "--progress": `${(settings.workDuration - 1) / 89 * 100}%` } as React.CSSProperties}
            />
            <div className="setting-range-labels">
              <span>1 dk</span>
              <span>90 dk</span>
            </div>
          </div>
        </div>

        {/* Short Break Duration */}
        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon-wrap">
              <Coffee size={20} />
            </div>
            <div className="setting-info">
              <span className="setting-name">Kisa Mola Suresi</span>
              <span className="setting-desc">Pomodoro arasindaki dinlenme</span>
            </div>
            <div className="setting-value">
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(30, parseInt(e.target.value) || 1));
                  updateSetting("shortBreakDuration", val);
                }}
                className="setting-number-input"
              />
              <span className="setting-unit">dk</span>
            </div>
          </div>
          <div className="setting-slider-wrap">
            <input
              type="range"
              min="1"
              max="30"
              value={settings.shortBreakDuration}
              onChange={(e) => updateSetting("shortBreakDuration", parseInt(e.target.value))}
              className="setting-slider"
              style={{ "--progress": `${(settings.shortBreakDuration - 1) / 29 * 100}%` } as React.CSSProperties}
            />
            <div className="setting-range-labels">
              <span>1 dk</span>
              <span>30 dk</span>
            </div>
          </div>
        </div>

        {/* Long Break Duration */}
        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon-wrap">
              <Timer size={20} />
            </div>
            <div className="setting-info">
              <span className="setting-name">Uzun Mola Suresi</span>
              <span className="setting-desc">Birden fazla pomodoro sonrasi</span>
            </div>
            <div className="setting-value">
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(60, parseInt(e.target.value) || 1));
                  updateSetting("longBreakDuration", val);
                }}
                className="setting-number-input"
              />
              <span className="setting-unit">dk</span>
            </div>
          </div>
          <div className="setting-slider-wrap">
            <input
              type="range"
              min="1"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) => updateSetting("longBreakDuration", parseInt(e.target.value))}
              className="setting-slider"
              style={{ "--progress": `${(settings.longBreakDuration - 1) / 59 * 100}%` } as React.CSSProperties}
            />
            <div className="setting-range-labels">
              <span>1 dk</span>
              <span>60 dk</span>
            </div>
          </div>
        </div>

        {/* Pomodoros Until Long Break */}
        <div className="setting-card">
          <div className="setting-header">
            <div className="setting-icon-wrap">
              <Repeat size={20} />
            </div>
            <div className="setting-info">
              <span className="setting-name">Uzun Moladan Onceki Pomodoro</span>
              <span className="setting-desc">Kac calisma seansindan sonra uzun molaya girilsin</span>
            </div>
            <div className="setting-value">
              <input
                type="number"
                min="1"
                max="10"
                value={settings.sessionsBeforeLongBreak}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                  updateSetting("sessionsBeforeLongBreak", val);
                }}
                className="setting-number-input"
              />
              <span className="setting-unit">adet</span>
            </div>
          </div>
          <div className="setting-slider-wrap">
            <input
              type="range"
              min="1"
              max="10"
              value={settings.sessionsBeforeLongBreak}
              onChange={(e) => updateSetting("sessionsBeforeLongBreak", parseInt(e.target.value))}
              className="setting-slider"
              style={{ "--progress": `${(settings.sessionsBeforeLongBreak - 1) / 9 * 100}%` } as React.CSSProperties}
            />
            <div className="setting-range-labels">
              <span>1</span>
              <span>10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Otomatik Baslatma</h3>
        <div className="settings-list">
          {/* Auto-start Breaks */}
          <div className="setting-card setting-card-toggle">
            <div className="setting-header">
              <div className="setting-icon-wrap">
                <PlayCircle size={20} />
              </div>
              <div className="setting-info">
                <span className="setting-name">Otomatik Mola Baslat</span>
                <span className="setting-desc">Calisma bitince molayı otomatik baslat</span>
              </div>
              <button
                onClick={() => updateSetting("autoStartBreaks", !settings.autoStartBreaks)}
                className={`toggle-btn ${settings.autoStartBreaks ? "on" : "off"}`}
              >
                {settings.autoStartBreaks ? <BellRing size={16} /> : <BellRing size={16} />}
              </button>
            </div>
          </div>

          {/* Auto-start Pomodoros */}
          <div className="setting-card setting-card-toggle">
            <div className="setting-header">
              <div className="setting-icon-wrap">
                <PlayCircle size={20} />
              </div>
              <div className="setting-info">
                <span className="setting-name">Otomatik Calisma Baslat</span>
                <span className="setting-desc">Mola bitince calismayi otomatik baslat</span>
              </div>
              <button
                onClick={() => updateSetting("autoStartPomodoros", !settings.autoStartPomodoros)}
                className={`toggle-btn ${settings.autoStartPomodoros ? "on" : "off"}`}
              >
                {settings.autoStartPomodoros ? <BellRing size={16} /> : <BellRing size={16} />}
              </button>
            </div>
          </div>

          {/* Notification Sounds */}
          <div className="setting-card setting-card-toggle">
            <div className="setting-header">
              <div className="setting-icon-wrap">
                <BellRing size={20} />
              </div>
              <div className="setting-info">
                <span className="setting-name">Bildirim Sesleri</span>
                <span className="setting-desc">Seans tamamlandiginda sesli bildirim ver</span>
              </div>
              <button
                onClick={() => updateSetting("notificationSounds", !settings.notificationSounds)}
                className={`toggle-btn ${settings.notificationSounds ? "on" : "off"}`}
              >
                {settings.notificationSounds ? <BellRing size={16} /> : <BellRing size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button
          onClick={handleReset}
          className="settings-btn settings-btn-reset"
        >
          <RotateCcw size={18} />
          <span>Sifirla</span>
        </button>
        <button
          onClick={handleSave}
          className={`settings-btn settings-btn-save ${saved ? "saved" : ""}`}
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          <span>{saved ? "Kaydedildi!" : "Kaydet"}</span>
        </button>
      </div>
    </div>
  );
}
