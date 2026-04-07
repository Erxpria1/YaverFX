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
  const accent = "var(--theme-accent)";
  const text = "var(--theme-text)";
  const secondary = "var(--theme-secondary)";
  const border = "var(--theme-border)";

  return (
    <div className="flex flex-col gap-4 w-full px-4">
      <h2 className="text-lg font-semibold" style={{ color: text }}>Ödüller</h2>
      
      <div className="rounded-xl p-4" style={{ backgroundColor: secondary, border: `1px solid ${border}` }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-2xl font-bold" style={{ color: text }}>Seviye {data.level}</div>
            <div className="text-sm" style={{ color: text, opacity: 0.6 }}>{POINTS_PER_LEVEL - (data.points % POINTS_PER_LEVEL)} puan sonraki seviye</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: accent }}>⭐ {data.points}</div>
            <div className="text-sm" style={{ color: text, opacity: 0.6 }}>{data.totalSessions} seans</div>
          </div>
        </div>
        
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: border }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: accent }} />
        </div>
      </div>

      <div className="flex justify-center gap-8 py-2">
        <div className="flex flex-col items-center">
          <span className="text-2xl">🔥</span>
          <span className="text-sm font-bold" style={{ color: text }}>{data.streak}</span>
          <span className="text-xs" style={{ color: text, opacity: 0.6 }}>gün</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl">⭐</span>
          <span className="text-sm font-bold" style={{ color: text }}>{data.points}</span>
          <span className="text-xs" style={{ color: text, opacity: 0.6 }}>puan</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl">🎯</span>
          <span className="text-sm font-bold" style={{ color: text }}>{data.totalSessions}</span>
          <span className="text-xs" style={{ color: text, opacity: 0.6 }}>seans</span>
        </div>
      </div>
    </div>
  );
}
