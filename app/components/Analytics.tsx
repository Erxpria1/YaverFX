"use client";

import { useState, useEffect, useMemo } from "react";

interface DailyStats {
  date: string;
  focusMinutes: number;
  tasksCompleted: number;
  pointsEarned: number;
}

interface StoredStats {
  focusTime: number;
  tasksDone: number;
  streak: number;
  points: number;
}

const STORAGE_KEY = "yaverfx-stats";

function loadStats(): StoredStats {
  if (typeof window === "undefined") {
    return { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        focusTime: Number(parsed.focusTime) || 0,
        tasksDone: Number(parsed.tasksDone) || 0,
        streak: Number(parsed.streak) || 0,
        points: Number(parsed.points) || 0,
      };
    }
  } catch {
    console.warn("Failed to load stats");
  }
  return { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };
}

function generateDailyHistory(stats: StoredStats): DailyStats[] {
  // Generate last 7 days of mock data based on current stats
  // In production, this would be stored separately per day
  const days: DailyStats[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Mock data based on streak and points (distribute across days)
    const baseFocus = stats.focusTime / Math.max(stats.streak, 1);
    const variance = Math.random() * 0.4 - 0.2; // ±20%
    const focusMinutes = Math.round(baseFocus * (1 + variance));

    days.push({
      date: dateStr,
      focusMinutes: i === 0 ? stats.focusTime : focusMinutes,
      tasksCompleted: i === 0 ? stats.tasksDone : Math.round(focusMinutes / 25),
      pointsEarned: i === 0 ? stats.points : Math.round(focusMinutes * 0.4),
    });
  }

  return days;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric" });
}

export default function Analytics() {
  const [stats, setStats] = useState<StoredStats>(loadStats);
  const [period, setPeriod] = useState<"week" | "day">("week");

  useEffect(() => {
    const handleUpdate = () => setStats(loadStats());
    window.addEventListener("yaverfx-stats-update", handleUpdate);
    return () => window.removeEventListener("yaverfx-stats-update", handleUpdate);
  }, []);

  const dailyData = useMemo(() => generateDailyHistory(stats), [stats]);

  // Calculate trends
  const totalFocusMinutes = dailyData.reduce((sum, d) => sum + d.focusMinutes, 0);
  const totalTasks = dailyData.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const totalPoints = dailyData.reduce((sum, d) => sum + d.pointsEarned, 0);

  const avgDailyFocus = Math.round(totalFocusMinutes / 7);
  const maxFocus = Math.max(...dailyData.map(d => d.focusMinutes), 1);

  // Find best day
  const bestDay = dailyData.reduce((best, day) =>
    day.focusMinutes > best.focusMinutes ? day : best, dailyData[0]);

  return (
    <div className="analytics-container">
      {/* Overview Cards */}
      <div className="analytics-overview">
        <div className="analytics-card">
          <span className="analytics-value">{Math.floor(stats.focusTime / 60)}</span>
          <span className="analytics-label">Toplam Saat</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-value">{stats.tasksDone}</span>
          <span className="analytics-label">Tamamlanan Görev</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-value">{stats.streak}</span>
          <span className="analytics-label">Gün Serisi</span>
        </div>
        <div className="analytics-card highlight">
          <span className="analytics-value">{stats.points}</span>
          <span className="analytics-label">Toplam Puan</span>
        </div>
      </div>

      {/* Weekly Focus Chart */}
      <div className="analytics-section">
        <h4 className="analytics-section-title">📊 Haftalık Odak Süresi</h4>
        <div className="bar-chart">
          {dailyData.map((day, i) => (
            <div key={day.date} className="bar-column">
              <div className="bar-wrapper">
                <div
                  className="bar-fill"
                  style={{ height: `${(day.focusMinutes / maxFocus) * 100}%` }}
                  title={`${day.focusMinutes} dk`}
                >
                  {day.focusMinutes > 0 && (
                    <span className="bar-value">{day.focusMinutes}</span>
                  )}
                </div>
              </div>
              <span className="bar-label">{formatDate(day.date)}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span>Ortalama: {avgDailyFocus} dk/gün</span>
          <span>En iyi: {formatDate(bestDay.date)} ({bestDay.focusMinutes} dk)</span>
        </div>
      </div>

      {/* Tasks Completed Chart */}
      <div className="analytics-section">
        <h4 className="analytics-section-title">✅ Görev Grafiği</h4>
        <div className="bar-chart secondary">
          {dailyData.map((day) => (
            <div key={day.date} className="bar-column">
              <div className="bar-wrapper">
                <div
                  className="bar-fill tasks"
                  style={{ height: `${Math.min(day.tasksCompleted * 20, 100)}%` }}
                  title={`${day.tasksCompleted} görev`}
                >
                  {day.tasksCompleted > 0 && (
                    <span className="bar-value">{day.tasksCompleted}</span>
                  )}
                </div>
              </div>
              <span className="bar-label">{formatDate(day.date)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Points Trend Line Chart (SVG) */}
      <div className="analytics-section">
        <h4 className="analytics-section-title">⭐ Puan Trendi</h4>
        <svg className="line-chart" viewBox="0 0 350 120" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          <line x1="30" y1="20" x2="340" y2="20" stroke="var(--surface-light)" strokeWidth="1" strokeDasharray="4" />
          <line x1="30" y1="50" x2="340" y2="50" stroke="var(--surface-light)" strokeWidth="1" strokeDasharray="4" />
          <line x1="30" y1="80" x2="340" y2="80" stroke="var(--surface-light)" strokeWidth="1" strokeDasharray="4" />

          {/* Line path */}
          {(() => {
            const maxPoints = Math.max(...dailyData.map(d => d.pointsEarned), 1);
            const points = dailyData.map((day, i) => {
              const x = 30 + (i * (310 / 6));
              const y = 100 - ((day.pointsEarned / maxPoints) * 80);
              return `${x},${y}`;
            });

            return (
              <>
                {/* Area fill */}
                <polygon
                  points={`30,100 ${points.join(" ")} 340,100`}
                  fill="var(--accent)"
                  opacity="0.15"
                />
                {/* Line */}
                <polyline
                  points={points.join(" ")}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {dailyData.map((day, i) => {
                  const x = 30 + (i * (310 / 6));
                  const y = 100 - ((day.pointsEarned / maxPoints) * 80);
                  return (
                    <circle
                      key={day.date}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="var(--accent)"
                      stroke="var(--bg)"
                      strokeWidth="2"
                    />
                  );
                })}
              </>
            );
          })()}
        </svg>
        <div className="chart-legend">
          <span>Toplam: {totalPoints} puan</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="analytics-summary">
        <div className="summary-item">
          <span className="summary-icon">🔥</span>
          <span>{stats.streak} gün üst üste</span>
        </div>
        <div className="summary-item">
          <span className="summary-icon">🎯</span>
          <span>{avgDailyFocus} dk/gün ortalaman</span>
        </div>
      </div>
    </div>
  );
}