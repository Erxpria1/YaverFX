"use client";

import { useState, useEffect } from "react";
import { NOTIFICATION_SOUNDS, setStoredSoundId, type NotificationSoundId } from "../utils/audio";

function getStoredSoundId(): NotificationSoundId {
  if (typeof window === "undefined") return "default";
  return (localStorage.getItem("yaverfx-notification-sound") as NotificationSoundId) || "default";
}

export default function NotificationSoundPicker() {
  const [selectedSound, setSelectedSound] = useState<NotificationSoundId>("default");

  useEffect(() => {
    setSelectedSound(getStoredSoundId());
  }, []);

  const handleSelect = (soundId: NotificationSoundId) => {
    setSelectedSound(soundId);
    setStoredSoundId(soundId);

    // Play preview sound
    if (soundId === "default") {
      // Play synthesized default
      try {
        // @ts-expect-error - webkitAudioContext is non-standard
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const now = ctx.currentTime;
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            osc.type = "sine";
            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.4);
          });
        }
      } catch (e) {
        console.warn("Audio preview failed", e);
      }
    }
  };

  return (
    <div className="notification-sound-picker">
      <div className="sound-picker-label">Bildirim Sesi</div>
      <div className="sound-picker-grid">
        {NOTIFICATION_SOUNDS.map((sound) => (
          <button
            key={sound.id}
            className={`sound-picker-btn ${selectedSound === sound.id ? "active" : ""}`}
            onClick={() => handleSelect(sound.id)}
          >
            <span className="sound-picker-icon">{sound.icon}</span>
            <span className="sound-picker-name">{sound.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}