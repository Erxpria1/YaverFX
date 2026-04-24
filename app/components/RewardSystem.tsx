"use client";

import { useEffect, useState } from "react";
import { getAppName, setAppName } from "../context/TimerContext";
import { calculateLevel, getCompanionForLevel, COMPANIONS, StoredStats, loadStats } from "../utils/stats";
import PixelCompanion from "./PixelCompanion";

const POINTS_PER_LEVEL = 100;

type Theme = "modern" | "cyber" | "minimal" | "pixel";

export default function RewardSystem() {
  const [stats, setStats] = useState<StoredStats>({ focusTime: 0, tasksDone: 0, streak: 0, points: 0 });
  const [appName, setAppNameState] = useState(getAppName());
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(appName);
  const [currentTheme, setCurrentTheme] = useState<Theme>("modern");

  useEffect(() => {
    const handleStatsUpdate = () => setStats(loadStats());
    const handleNameUpdate = () => setAppNameState(getAppName());
    const handleThemeUpdate = () => {
      const t = localStorage.getItem("yaverfx-theme") as Theme;
      if (t && ["modern", "cyber", "minimal", "pixel"].includes(t)) setCurrentTheme(t);
    };

    handleStatsUpdate();
    handleNameUpdate();
    handleThemeUpdate();
    window.addEventListener("yaverfx-stats-update", handleStatsUpdate);
    window.addEventListener("yaverfx-name-update", handleNameUpdate);
    window.addEventListener("yaverfx-theme-update", handleThemeUpdate);
    window.addEventListener("storage", handleStatsUpdate);
    window.addEventListener("storage", handleNameUpdate);
    window.addEventListener("storage", handleThemeUpdate);

    return () => {
      window.removeEventListener("yaverfx-stats-update", handleStatsUpdate);
      window.removeEventListener("yaverfx-name-update", handleNameUpdate);
      window.removeEventListener("yaverfx-theme-update", handleThemeUpdate);
      window.removeEventListener("storage", handleStatsUpdate);
      window.removeEventListener("storage", handleNameUpdate);
      window.removeEventListener("storage", handleThemeUpdate);
    };
  }, []);

  const handleNameSave = () => {
    if (tempName.trim()) setAppName(tempName.trim());
    setShowNameModal(false);
  };

  const level = calculateLevel(stats.points);
  const progress = stats.points % POINTS_PER_LEVEL;
  const currentCompanion = getCompanionForLevel(level);

  return (
    <div className="rewards-layout" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Name Edit Button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => { setTempName(appName); setShowNameModal(true); }}
          style={{
            background: "var(--surface-light)",
            padding: "8px 16px",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontWeight: "bold",
          }}
        >
          📝 İsim Değiştir ({appName})
        </button>
      </div>

      {/* Main Reward Card */}
      <div className="reward-box animate-in" style={{ position: "relative", overflow: "hidden" }}>
        {/* Background Companion Canvas */}
        <div
          style={{
            position: "absolute",
            right: "-20px",
            bottom: "-20px",
            opacity: 0.15,
            pointerEvents: "none",
            transform: "scale(1.5)",
          }}
        >
          <PixelCompanion companion={currentCompanion} size={200} animate={false} theme={currentTheme} />
        </div>

        <div className="reward-top" style={{ position: "relative", zIndex: 1 }}>
          <div className="reward-lvl">
            <span className="reward-val">{level}</span>
            <span className="reward-lbl">SEVİYE</span>
          </div>
          <div className="reward-pts">
            <span className="reward-val">{stats.points}</span>
            <span className="reward-lbl">TOPLAM PUAN</span>
          </div>
        </div>

        <div className="reward-bar" style={{ position: "relative", zIndex: 1 }}>
          <div className="reward-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="reward-stats" style={{ position: "relative", zIndex: 1 }}>
          <div className="reward-stat">
            <span className="reward-icon">🔥</span>
            <div className="reward-num">{stats.streak}</div>
            <div className="reward-label">GÜN SERİSİ</div>
          </div>
          <div className="reward-stat">
            <span className="reward-icon">⏱️</span>
            <div className="reward-num">{Math.floor(stats.focusTime)}</div>
            <div className="reward-label">DAKİKA ODAK</div>
          </div>
          <div className="reward-stat">
            <span className="reward-icon">✅</span>
            <div className="reward-num">{stats.tasksDone}</div>
            <div className="reward-label">GÖREV BİTTİ</div>
          </div>
        </div>
      </div>

      {/* Companions Collection */}
      <div className="companions-collection animate-in" style={{ animationDelay: "0.1s" }}>
        <h3
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Takım Arkadaşları
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "12px",
          }}
        >
          {COMPANIONS.map((comp) => {
            const isUnlocked = level >= comp.level;
            const isCurrent = comp.level === currentCompanion.level;

            return (
              <div
                key={comp.level}
                style={{
                  background: isCurrent ? "var(--surface-light)" : "var(--surface)",
                  border: isCurrent ? "1.5px solid var(--accent)" : "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isUnlocked ? 1 : 0.4,
                  filter: isUnlocked ? "none" : "grayscale(100%)",
                  position: "relative",
                }}
              >
                {isCurrent && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "var(--accent)",
                      color: "var(--bg)",
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    Aktif
                  </span>
                )}
                <PixelCompanion companion={comp} size={48} animate={false} theme={currentTheme} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", fontWeight: "bold", color: "var(--text)" }}>
                    {isUnlocked ? comp.name : "???"}
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--text-secondary)" }}>Sv. {comp.level}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Name Edit Modal */}
      {showNameModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowNameModal(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              width: "100%",
              maxWidth: "320px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "bold" }}>İsim Değiştir</h3>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Yeni isim..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg)",
                border: "1px solid var(--border-light)",
                color: "var(--text)",
                fontSize: "16px",
                marginBottom: "16px",
              }}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowNameModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-light)",
                  color: "var(--text-secondary)",
                  fontWeight: "bold",
                  border: "none",
                }}
              >
                İptal
              </button>
              <button
                onClick={handleNameSave}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--accent)",
                  color: "var(--bg)",
                  fontWeight: "bold",
                  border: "none",
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}