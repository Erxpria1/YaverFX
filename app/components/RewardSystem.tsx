"use client";

import { useState, useEffect } from "react";

interface RewardData {
  points: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  totalSessions: number;
}

const POINTS_PER_SESSION = 10;
const POINTS_PER_LEVEL = 100;

export default function RewardSystem() {
  const [data, setData] = useState<RewardData>({
    points: 0, level: 1, streak: 0, lastActiveDate: "", totalSessions: 0
  });

  useEffect(() => {
    const stored = localStorage.getItem("yaverfx-rewards");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const addPoints = () => {
    const today = new Date().toISOString().split("T")[0];
    const newData = { ...data };
    newData.points += POINTS_PER_SESSION;
    newData.totalSessions += 1;
    newData.level = Math.floor(newData.points / POINTS_PER_LEVEL) + 1;
    if (newData.lastActiveDate !== today) {
      if (newData.lastActiveDate) {
        const diff = (new Date(today).getTime() - new Date(newData.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24);
        newData.streak = diff === 1 ? newData.streak + 1 : 1;
      } else {
        newData.streak = 1;
      }
      newData.lastActiveDate = today;
    }
    localStorage.setItem("yaverfx-rewards", JSON.stringify(newData));
    setData(newData);
  };

  useEffect(() => {
    (window as any).addYaverFxPoints = addPoints;
    return () => { delete (window as any).addYaverFxPoints; };
  }, [data]);

  const progress = (data.points % POINTS_PER_LEVEL) / POINTS_PER_LEVEL * 100;

  return (
    <div className="rewards-wrapper">
      <h2 className="section-title">Ödüller</h2>
      
      <div className="reward-card">
        <div className="reward-header">
          <div className="reward-level">
            <span className="reward-level-title">Seviye {data.level}</span>
            <span className="reward-level-sub">{POINTS_PER_LEVEL - (data.points % POINTS_PER_LEVEL)} puan sonraki seviye</span>
          </div>
          <div className="reward-points">
            <span className="reward-points-value">{data.points}</span>
            <span className="reward-points-sub">{data.totalSessions} seans</span>
          </div>
        </div>
        
        <div className="reward-progress">
          <div className="reward-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="reward-stats">
        <div className="reward-stat">
          <span className="reward-stat-icon">🔥</span>
          <span className="reward-stat-value">{data.streak}</span>
          <span className="reward-stat-label">gün</span>
        </div>
        <div className="reward-stat">
          <span className="reward-stat-icon">⭐</span>
          <span className="reward-stat-value">{data.points}</span>
          <span className="reward-stat-label">puan</span>
        </div>
        <div className="reward-stat">
          <span className="reward-stat-icon">🎯</span>
          <span className="reward-stat-value">{data.totalSessions}</span>
          <span className="reward-stat-label">seans</span>
        </div>
      </div>
    </div>
  );
}