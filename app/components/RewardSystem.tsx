"use client";

import { useEffect, useState } from "react";

interface Stats {
  focusTime: number;
  tasksDone: number;
  streak: number;
  points: number;
}

const POINTS_PER_LEVEL = 100;

export default function RewardSystem() {
  const [stats, setStats] = useState<Stats>({ focusTime: 0, tasksDone: 0, streak: 0, points: 0 });

  useEffect(() => {
    const update = () => {
      const stored = localStorage.getItem("yaverfx-stats");
      if (stored) setStats(JSON.parse(stored));
    };
    update();
    window.addEventListener("yaverfx-stats-update", update);
    return () => window.removeEventListener("yaverfx-stats-update", update);
  }, []);

  const level = Math.floor(stats.points / POINTS_PER_LEVEL) + 1;
  const progress = (stats.points % POINTS_PER_LEVEL);

  return (
    <div className="reward-box animate-in">
      <div className="reward-top">
        <div className="reward-lvl">
          <span className="reward-val">{level}</span>
          <span className="reward-lbl">SEVİYE</span>
        </div>
        <div className="reward-pts">
          <span className="reward-val">{stats.points}</span>
          <span className="reward-lbl">TOPLAM PUAN</span>
        </div>
      </div>
      
      <div className="reward-bar">
        <div className="reward-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="reward-stats">
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
  );
}
