"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Flame, Clock, Target, TrendingUp, Award, Calendar } from "lucide-react";
import { loadDailyLog, loadStats, type DailyLogEntry, type StoredStats } from "../utils/stats";

type DayRow = {
  date: string;
  label: string;
  shortLabel: string;
  focusMinutes: number;
  pomodoros: number;
};

type ReportData = {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  avgDailyMinutes: number;
  weekData: DayRow[];
  bestDay: DayRow | null;
};

const WEEK_DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const WEEK_DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const WEEKLY_GOAL_MINUTES = 600;

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildReportData(stats: StoredStats, log: DailyLogEntry[]): ReportData {
  const todayKey = getLocalDateKey();
  const today = new Date();
  const weekStart = getWeekStart(today);

  const map = new Map<string, DailyLogEntry>();
  for (const entry of log) map.set(entry.date, entry);

  const weekData: DayRow[] = [];
  let weekMinutes = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key = getLocalDateKey(d);
    const entry = map.get(key);
    const focusMinutes = entry?.focusMinutes ?? 0;
    const pomodoros = entry?.pomodoros ?? 0;

    weekMinutes += focusMinutes;
    weekData.push({
      date: key,
      label: WEEK_DAYS[i],
      shortLabel: WEEK_DAYS_SHORT[i],
      focusMinutes,
      pomodoros,
    });
  }

  const todayMinutes = map.get(todayKey)?.focusMinutes ?? 0;
  const last30 = log.filter(entry => entry.date >= getLocalDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)));
  const monthMinutes = last30.reduce((sum, entry) => sum + entry.focusMinutes, 0);
  const activeDays = log.filter(entry => entry.focusMinutes > 0).length;
  const avgDailyMinutes = activeDays > 0 ? Math.round(monthMinutes / Math.min(activeDays, 30)) : 0;
  const bestDay = weekData.reduce<DayRow | null>((best, current) => {
    if (!best) return current;
    return current.focusMinutes > best.focusMinutes ? current : best;
  }, null);

  return {
    todayMinutes,
    weekMinutes,
    monthMinutes,
    avgDailyMinutes,
    weekData,
    bestDay,
  };
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="report-stat-card">
      <div className={`stat-icon-wrapper ${tone}`}>{icon}</div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

function MiniBars({ data }: { data: DayRow[] }) {
  const max = Math.max(...data.map(d => d.focusMinutes), 1);
  return (
    <div className="report-mini-bars">
      {data.map(day => {
        const height = Math.max((day.focusMinutes / max) * 100, day.focusMinutes > 0 ? 12 : 4);
        return (
          <div key={day.date} className="mini-bar-item">
            <div className="mini-bar-track">
              <div className="mini-bar-fill" style={{ height: `${height}%` }} />
            </div>
            <span className="mini-bar-label">{day.shortLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportPanel() {
  const [stats, setStats] = useState<StoredStats>(() => loadStats());
  const [dailyLog, setDailyLog] = useState<DailyLogEntry[]>(() => loadDailyLog());
  const [activeTab, setActiveTab] = useState<"overview" | "weekly">("overview");

  useEffect(() => {
    const handleUpdate = () => {
      setStats(loadStats());
      setDailyLog(loadDailyLog());
    };

    handleUpdate();
    window.addEventListener("yaverfx-stats-update", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("yaverfx-stats-update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const reportData = useMemo(() => buildReportData(stats, dailyLog), [stats, dailyLog]);
  const weeklyProgress = Math.min((reportData.weekMinutes / WEEKLY_GOAL_MINUTES) * 100, 100);
  const trendData = reportData.weekData.map(day => day.focusMinutes);
  const weeklyPomodoros = reportData.weekData.reduce((sum, day) => sum + day.pomodoros, 0);

  if (!dailyLog.length && stats.focusTime === 0) {
    return (
      <div className="report-container">
        <div className="report-header">
          <div className="report-title-section">
            <h2 className="report-title">Rapor</h2>
            <p className="report-subtitle">İlk odak kaydın burada görünecek</p>
          </div>
        </div>
        <div className="report-empty-state">
          <div className="report-empty-icon">
            <Flame size={28} />
          </div>
          <p>Henüz kayıt yok.</p>
          <span>Bir pomodoro tamamladığında rapor otomatik dolacak.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <div className="report-title-section">
          <h2 className="report-title">Rapor</h2>
          <p className="report-subtitle">Gerçek odak kayıtların burada</p>
        </div>
        <div className="report-streak-badge">
          <Flame size={16} className="streak-icon" />
          <span>{stats.streak} gün</span>
        </div>
      </div>

      <div className="report-stats-grid">
        <StatCard icon={<Clock size={20} />} value={formatMinutes(reportData.todayMinutes)} label="Bugün" tone="today" />
        <StatCard icon={<Calendar size={20} />} value={formatMinutes(reportData.weekMinutes)} label="Bu Hafta" tone="week" />
        <StatCard icon={<TrendingUp size={20} />} value={formatMinutes(reportData.monthMinutes)} label="Bu Ay" tone="month" />
        <StatCard icon={<Target size={20} />} value={formatMinutes(reportData.avgDailyMinutes)} label="Günlük Ort." tone="avg" />
      </div>

      <div className="report-progress-section">
        <div className="progress-header">
          <span className="progress-title">Haftalık Hedef</span>
          <span className="progress-value">{Math.round(weeklyProgress)}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${weeklyProgress}%` }} />
        </div>
        <span className="progress-detail">
          {formatMinutes(reportData.weekMinutes)} / {formatMinutes(WEEKLY_GOAL_MINUTES)}
        </span>
      </div>

      <div className="report-tabs">
        <button
          className={`report-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Haftalık Özet
        </button>
        <button
          className={`report-tab ${activeTab === "weekly" ? "active" : ""}`}
          onClick={() => setActiveTab("weekly")}
        >
          Günlere Göre
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="report-tab-content">
          <div className="report-chart-card">
            <h4 className="chart-title">Haftalık Odak Saati</h4>
            <MiniBars data={reportData.weekData} />
            {reportData.bestDay && reportData.bestDay.focusMinutes > 0 && (
              <div className="chart-insight">
                <Award size={14} />
                <span>
                  En iyi günün: {reportData.bestDay.label} ({formatMinutes(reportData.bestDay.focusMinutes)})
                </span>
              </div>
            )}
          </div>

          <div className="report-chart-card small">
            <h4 className="chart-title">Odak Trendi</h4>
            <div className="report-trend-line">
              {trendData.map((value, index) => (
                <div key={`${index}-${value}`} className="trend-dot-wrap">
                  <div className="trend-dot" style={{ transform: `translateY(${Math.max(0, 80 - Math.min(value, 80))}%)` }} />
                </div>
              ))}
            </div>
            <div className="report-trend-labels">
              {reportData.weekData.map(day => (
                <span key={day.date}>{day.shortLabel}</span>
              ))}
            </div>
          </div>

          <div className="report-quick-stats">
            <div className="quick-stat">
              <span className="quick-stat-value">{stats.tasksDone}</span>
              <span className="quick-stat-label">Tamamlanan Görev</span>
            </div>
            <div className="quick-stat-divider" />
            <div className="quick-stat">
              <span className="quick-stat-value">{stats.points}</span>
              <span className="quick-stat-label">Toplam Puan</span>
            </div>
            <div className="quick-stat-divider" />
            <div className="quick-stat">
              <span className="quick-stat-value">{weeklyPomodoros}</span>
              <span className="quick-stat-label">Pomodoro</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "weekly" && (
        <div className="report-tab-content">
          <div className="report-days-list">
            {reportData.weekData.map(day => {
              const isBest = reportData.bestDay?.date === day.date && day.focusMinutes > 0;
              return (
                <div key={day.date} className={`report-day-item ${isBest ? "best" : ""}`}>
                  <div className="day-info">
                    <span className="day-name">{day.label}</span>
                    <span className="day-pomodoros">{day.pomodoros} pomodoro</span>
                  </div>
                  <div className="day-stats">
                    <span className="day-focus-time">{formatMinutes(day.focusMinutes)}</span>
                    <div className="day-bar-container">
                      <div className="day-bar" style={{ width: `${Math.min((day.focusMinutes / 180) * 100, 100)}%` }} />
                    </div>
                  </div>
                  {isBest && <span className="best-badge">En İyi</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="report-footer">
        <div className="footer-message">
          <Flame size={14} className="footer-icon" />
          <span>{stats.streak > 0 ? `${stats.streak} gün üst üste! Devam et! 🔥` : "Bugün başlamak için hazır mısın?"}</span>
        </div>
      </div>
    </div>
  );
}
