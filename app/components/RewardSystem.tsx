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

const ENCOURAGING_MESSAGES = [
  "Harika gidiyorsun! 🔥",
  "Mükemmel odaklanma! ⭐",
  "Bir adım daha ileri! 🚀",
  "Sen bu işi biliyorsun! 💪",
  "Odak kralı! 👑",
  "Güzel ilerleme! ✨",
  "Pes etme! 🎯",
  "Her seans değerli! 🌟",
];

function getStoredRewardData(): RewardData {
  if (typeof window === "undefined") {
    return { points: 0, level: 1, streak: 0, lastActiveDate: "", totalSessions: 0 };
  }
  
  const stored = localStorage.getItem("yaverfx-rewards");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { points: 0, level: 1, streak: 0, lastActiveDate: "", totalSessions: 0 };
    }
  }
  return { points: 0, level: 1, streak: 0, lastActiveDate: "", totalSessions: 0 };
}

function saveRewardData(data: RewardData) {
  if (typeof window !== "undefined") {
    localStorage.setItem("yaverfx-rewards", JSON.stringify(data));
  }
}

export default function RewardSystem() {
  const [data, setData] = useState<RewardData>({
    points: 0,
    level: 1,
    streak: 0,
    lastActiveDate: "",
    totalSessions: 0,
  });
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = getStoredRewardData();
    const today = new Date().toISOString().split("T")[0];
    const lastActive = stored.lastActiveDate;

    // Check streak
    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        stored.streak = 0;
      }
    }

    setData(stored);
  }, []);

  const addPoints = () => {
    const today = new Date().toISOString().split("T")[0];
    const newData = { ...data };
    
    newData.points += POINTS_PER_SESSION;
    newData.totalSessions += 1;
    
    // Level up
    const newLevel = Math.floor(newData.points / POINTS_PER_LEVEL) + 1;
    const leveledUp = newLevel > newData.level;
    newData.level = newLevel;
    
    // Update streak
    if (newData.lastActiveDate !== today) {
      if (newData.lastActiveDate) {
        const lastDate = new Date(newData.lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newData.streak += 1;
        } else if (diffDays > 1) {
          newData.streak = 1;
        }
      } else {
        newData.streak = 1;
      }
      newData.lastActiveDate = today;
    }

    // Show encouraging message on level up
    if (leveledUp) {
      setMessage(ENCOURAGING_MESSAGES[newData.level % ENCOURAGING_MESSAGES.length]);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }

    saveRewardData(newData);
    setData(newData);
  };

  // Expose addPoints globally for timer to call
  useEffect(() => {
    (window as any).addYaverFxPoints = addPoints;
    return () => {
      delete (window as any).addYaverFxPoints;
    };
  }, [data]);

  const pointsToNextLevel = POINTS_PER_LEVEL - (data.points % POINTS_PER_LEVEL);
  const progressPercent = ((POINTS_PER_LEVEL - pointsToNextLevel) / POINTS_PER_LEVEL) * 100;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Ödül Sistemi</h2>
        <div className="flex items-center gap-1">
          <span className="text-rose-400">🔥</span>
          <span className="text-sm font-semibold text-zinc-300">{data.streak} gün</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-zinc-100">Seviye {data.level}</span>
          <span className="text-xs text-zinc-500">{pointsToNextLevel} puan sonraki seviye</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-emerald-400">⭐ {data.points}</span>
          <span className="text-xs text-zinc-500">{data.totalSessions} seans</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Level up message */}
      {showMessage && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-4 py-2 text-sm font-medium text-emerald-400 animate-pulse">
          {message}
        </div>
      )}
    </div>
  );
}
