"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Flame, Clock, Target, TrendingUp, Award, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DailyStats {
  date: string;
  focusMinutes: number;
  pomodoros: number;
}

interface WeeklyStats {
  day: string;
  dayShort: string;
  focusMinutes: number;
  pomodoros: number;
}

interface StoredStats {
  focusTime: number;
  tasksDone: number;
  streak: number;
  points: number;
}

interface ReportData {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  currentStreak: number;
  avgDailyMinutes: number;
  weekData: WeeklyStats[];
}

const STORAGE_KEY = "yaverfx-stats";

// Mock data generator for demo purposes
function generateMockData(stats: StoredStats): ReportData {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Generate week data (Mon-Sun)
  const weekDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  const weekDaysShort = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const weekData: WeeklyStats[] = [];
  let weekTotal = 0;

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - mondayOffset + i);
    const dateStr = dayDate.toISOString().split("T")[0];
    const isToday = dateStr === todayStr;

    // Mock focus time based on stats (with variance)
    let focusMinutes: number;
    if (isToday) {
      focusMinutes = stats.focusTime % 480 || Math.floor(Math.random() * 120 + 30);
    } else {
      const base = Math.max(stats.focusTime / Math.max(stats.streak, 1), 25);
      focusMinutes = Math.floor(base * (0.5 + Math.random()));
    }

    weekTotal += focusMinutes;
    weekData.push({
      day: weekDays[i],
      dayShort: weekDaysShort[i],
      focusMinutes,
      pomodoros: Math.floor(focusMinutes / 25),
    });
  }

  // Calculate period stats (mock data for week/month)
  const weekMinutes = weekTotal;
  const monthDays = Math.min(30, Math.max(stats.streak * 3, 7));
  const monthMinutes = weekMinutes * (monthDays / 7) * (0.8 + Math.random() * 0.4);

  return {
    todayMinutes: weekData[mondayOffset + (dayOfWeek === 0 ? 6 : dayOfWeek - 1)]?.focusMinutes || 0,
    weekMinutes,
    monthMinutes: Math.floor(monthMinutes),
    currentStreak: stats.streak,
    avgDailyMinutes: Math.floor(weekMinutes / 7),
    weekData,
  };
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
}

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

// Canvas-based chart component
function FocusChart({ data }: { data: WeeklyStats[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas for high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 10, bottom: 30, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find max value for scaling
    const maxMinutes = Math.max(...data.map(d => d.focusMinutes), 1);

    // Draw bars
    const barWidth = chartWidth / data.length;
    const barGap = barWidth * 0.3;
    const actualBarWidth = barWidth - barGap;

    // Gradient for bars
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, "#a855f7"); // purple-500
    gradient.addColorStop(1, "#7c3aed"); // violet-600

    data.forEach((day, i) => {
      const x = padding.left + i * barWidth + barGap / 2;
      const barHeight = (day.focusMinutes / maxMinutes) * chartHeight;
      const y = height - padding.bottom - barHeight;

      // Draw bar with rounded top
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, actualBarWidth, barHeight, [6, 6, 0, 0]);
      ctx.fill();

      // Draw glow effect
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
      ctx.beginPath();
      ctx.roundRect(x, y, actualBarWidth, barHeight, [6, 6, 0, 0]);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw day label
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(day.dayShort, x + actualBarWidth / 2, height - 8);

      // Draw value on top of bar if > 0
      if (day.focusMinutes > 0) {
        ctx.fillStyle = "#a855f7";
        ctx.font = "bold 10px Inter, sans-serif";
        const hours = Math.floor(day.focusMinutes / 60);
        const mins = day.focusMinutes % 60;
        const label = hours > 0 ? `${hours}s` : `${mins}d`;
        ctx.fillText(label, x + actualBarWidth / 2, y - 6);
      }
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="report-chart-canvas"
      style={{ width: "100%", height: "160px" }}
    />
  );
}

// Line chart for trend
function TrendChart({ data }: { data: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);
    const range = maxValue - minValue || 1;

    const points = data.map((value, i) => ({
      x: padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right),
      y: height - padding.bottom - ((value - minValue) / range) * (height - padding.top - padding.bottom),
    }));

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height);
    gradient.addColorStop(0, "rgba(168, 85, 247, 0.4)");
    gradient.addColorStop(1, "rgba(168, 85, 247, 0.02)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Draw points
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#a855f7";
      ctx.fill();
      ctx.strokeStyle = "#09090b";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [data]);

  if (data.length < 2) return null;

  return (
    <canvas
      ref={canvasRef}
      className="report-chart-canvas"
      style={{ width: "100%", height: "80px" }}
    />
  );
}

export default function ReportPanel() {
  const [stats, setStats] = useState<StoredStats>(loadStats);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "weekly">("overview");

  useEffect(() => {
    const handleUpdate = () => {
      const loadedStats = loadStats();
      setStats(loadedStats);
      setReportData(generateMockData(loadedStats));
    };

    handleUpdate();
    window.addEventListener("yaverfx-stats-update", handleUpdate);
    const interval = setInterval(handleUpdate, 5000);

    return () => {
      window.removeEventListener("yaverfx-stats-update", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Calculate trend data for the last 7 days
  const trendData = useMemo(() => {
    if (!reportData) return [];
    return reportData.weekData.map(d => d.focusMinutes);
  }, [reportData]);

  // Find best day
  const bestDay = useMemo(() => {
    if (!reportData) return null;
    return reportData.weekData.reduce((best, day) =>
      day.focusMinutes > best.focusMinutes ? day : best, reportData.weekData[0]);
  }, [reportData]);

  // Weekly goal progress (assume 10 hours = 600 minutes per week goal)
  const weeklyGoal = 600;
  const weeklyProgress = reportData ? Math.min((reportData.weekMinutes / weeklyGoal) * 100, 100) : 0;

  return (
    <div className="report-container">
      {/* Header */}
      <div className="report-header">
        <div className="report-title-section">
          <h2 className="report-title">Odak Raporu</h2>
          <p className="report-subtitle">Ilerlemenizi takip edin</p>
        </div>
        <div className="report-streak-badge">
          <Flame size={16} className="streak-icon" />
          <span>{stats.streak} gun</span>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="report-stats-grid">
        <div className="report-stat-card">
          <div className="stat-icon-wrapper today">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatMinutes(reportData?.todayMinutes || 0)}</span>
            <span className="stat-label">Bugun</span>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="stat-icon-wrapper week">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatMinutes(reportData?.weekMinutes || 0)}</span>
            <span className="stat-label">Bu Hafta</span>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="stat-icon-wrapper month">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatMinutes(reportData?.monthMinutes || 0)}</span>
            <span className="stat-label">Bu Ay</span>
          </div>
        </div>

        <div className="report-stat-card highlight">
          <div className="stat-icon-wrapper avg">
            <Target size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatMinutes(reportData?.avgDailyMinutes || 0)}</span>
            <span className="stat-label">Gunluk Ort.</span>
          </div>
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="report-progress-section">
        <div className="progress-header">
          <span className="progress-title">Haftalik Hedef</span>
          <span className="progress-value">{Math.round(weeklyProgress)}%</span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${weeklyProgress}%` }}
          />
        </div>
        <span className="progress-detail">
          {formatMinutes(reportData?.weekMinutes || 0)} / {formatMinutes(weeklyGoal)}
        </span>
      </div>

      {/* Tabs */}
      <div className="report-tabs">
        <button
          className={`report-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Haftalik Ozet
        </button>
        <button
          className={`report-tab ${activeTab === "weekly" ? "active" : ""}`}
          onClick={() => setActiveTab("weekly")}
        >
          Gunlere Gore
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="report-tab-content">
          {/* Weekly Focus Chart */}
          <div className="report-chart-card">
            <h4 className="chart-title">Haftalik Odak Saati</h4>
            {reportData && <FocusChart data={reportData.weekData} />}
            {bestDay && (
              <div className="chart-insight">
                <Award size={14} />
                <span>En iyi gunun: {bestDay.day} ({formatMinutes(bestDay.focusMinutes)})</span>
              </div>
            )}
          </div>

          {/* Trend Line */}
          <div className="report-chart-card small">
            <h4 className="chart-title">Odak Trendi</h4>
            <TrendChart data={trendData} />
          </div>

          {/* Quick Stats */}
          <div className="report-quick-stats">
            <div className="quick-stat">
              <span className="quick-stat-value">{stats.tasksDone}</span>
              <span className="quick-stat-label">Tamamlanan Gorev</span>
            </div>
            <div className="quick-stat-divider" />
            <div className="quick-stat">
              <span className="quick-stat-value">{stats.points}</span>
              <span className="quick-stat-label">Toplam Puan</span>
            </div>
            <div className="quick-stat-divider" />
            <div className="quick-stat">
              <span className="quick-stat-value">
                {reportData ? Math.floor(reportData.weekMinutes / 25) : 0}
              </span>
              <span className="quick-stat-label">Pomodoros</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "weekly" && (
        <div className="report-tab-content">
          {/* Day by Day Breakdown */}
          <div className="report-days-list">
            {reportData?.weekData.map((day, index) => {
              const isBest = bestDay && day.focusMinutes === bestDay.focusMinutes;
              return (
                <div
                  key={day.day}
                  className={`report-day-item ${isBest ? "best" : ""}`}
                >
                  <div className="day-info">
                    <span className="day-name">{day.day}</span>
                    <span className="day-pomodoros">{day.pomodoros} pomodoro</span>
                  </div>
                  <div className="day-stats">
                    <span className="day-focus-time">{formatMinutes(day.focusMinutes)}</span>
                    <div className="day-bar-container">
                      <div
                        className="day-bar"
                        style={{
                          width: `${Math.min((day.focusMinutes / 180) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  {isBest && <span className="best-badge">En Iyi</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational Footer */}
      <div className="report-footer">
        <div className="footer-message">
          <Flame size={14} className="footer-icon" />
          <span>{stats.streak > 0 ? `${stats.streak} gun ustu uste! Devam et! 🔥` : "Bugun baslamak icin hazir misin?"}</span>
        </div>
      </div>
    </div>
  );
}
