"use client";

import { useState, useEffect } from "react";
import { NOTIFICATION_SOUNDS, setStoredSoundId, playNotificationSound, type NotificationSoundId } from "../utils/notifications";

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
    
    // Play preview
    playNotificationSound(soundId);
  };

  // Separate standard and voice sounds
  const standardSounds = NOTIFICATION_SOUNDS.filter(s => !s.isVoice);
  const voiceSounds = NOTIFICATION_SOUNDS.filter(s => s.isVoice);

  return (
    <div className="notification-sound-picker">
      <div className="sound-picker-label">Bildirim Sesi</div>
      
      <div className="sound-picker-section-label">Standart Sesler</div>
      <div className="sound-picker-grid">
        {standardSounds.map((sound) => (
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
      
      {voiceSounds.length > 0 && (
        <>
          <div className="sound-picker-section-label">Yapay Zeka Sesler</div>
          <div className="sound-picker-grid">
            {voiceSounds.map((sound) => (
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
          <div className="sound-picker-note">
            ℹ️ Ses dosyaları /sounds klasörüne eklendiğinde çalışır
          </div>
        </>
      )}
    </div>
  );
}
