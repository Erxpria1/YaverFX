// Centralized stats utilities — use these instead of duplicating loadStats/saveStats

export const POINTS_PER_LEVEL = 100;

export interface StoredStats {
  focusTime: number;
  tasksDone: number;
  streak: number;
  points: number;
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  pomodoros: number;
}

const STATS_KEY = "yaverfx-stats";
const APP_NAME_KEY = "yaverfx-app-name";
const DAILY_LOG_KEY = "yaverfx-daily-log";
const DEFAULT_STATS: StoredStats = { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };
const DEFAULT_APP_NAME = "Kerem";
const MAX_DAILY_LOG_DAYS = 90; // keep 90 days of history

// ─── Stats ───────────────────────────────────────────────

export function loadStats(): StoredStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) return DEFAULT_STATS;
    const parsed = JSON.parse(stored);
    return {
      focusTime: Number(parsed.focusTime) || 0,
      tasksDone: Number(parsed.tasksDone) || 0,
      streak: Number(parsed.streak) || 0,
      points: Number(parsed.points) || 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: StoredStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  window.dispatchEvent(new CustomEvent("yaverfx-stats-update"));
}

export function mergeStats(updates: Partial<StoredStats>): StoredStats {
  const current = loadStats();
  const next = { ...current, ...updates };
  saveStats(next);
  return next;
}

// ─── Level / Companion ──────────────────────────────────

export const COMPANIONS = [
  { level: 1, name: "Çırak Yaver", image: "/characters/char_0.png" },
  { level: 2, name: "Gözlemci", image: "/characters/char_1.png" },
  { level: 3, name: "Odak Ustası", image: "/characters/char_2.png" },
  { level: 4, name: "Zaman Bükücü", image: "/characters/char_3.png" },
  { level: 5, name: "Elit Yaver", image: "/characters/char_4.png" },
  { level: 6, name: "Efsanevi", image: "/characters/char_5.png" },
];

export function calculateLevel(points: number): number {
  return Math.floor(points / POINTS_PER_LEVEL) + 1;
}

export function getCompanionForLevel(level: number) {
  return COMPANIONS.reduce(
    (prev, curr) => (level >= curr.level ? curr : prev),
    COMPANIONS[0]
  );
}

// ─── App Name ────────────────────────────────────────────

export function getAppName(): string {
  if (typeof window === "undefined") return DEFAULT_APP_NAME;
  return localStorage.getItem(APP_NAME_KEY) || DEFAULT_APP_NAME;
}

export function setAppName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(APP_NAME_KEY, name);
  window.dispatchEvent(new CustomEvent("yaverfx-name-update"));
}

// ─── Daily Log (for Report panel) ─────────────────────────────────

function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadDailyLog(): DailyLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(DAILY_LOG_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveDailyLog(log: DailyLogEntry[]): void {
  if (typeof window === "undefined") return;
  // Keep only last MAX_DAILY_LOG_DAYS
  const trimmed = log.slice(-MAX_DAILY_LOG_DAYS);
  localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(trimmed));
}

export function logTodayFocus(minutes: number): void {
  if (typeof window === "undefined" || minutes <= 0) return;
  const today = getTodayStr();
  const log = loadDailyLog();
  const todayEntry = log.find(e => e.date === today);
  if (todayEntry) {
    todayEntry.focusMinutes += minutes;
    todayEntry.pomodoros += 1;
  } else {
    log.push({ date: today, focusMinutes: minutes, pomodoros: 1 });
  }
  saveDailyLog(log);
  window.dispatchEvent(new CustomEvent("yaverfx-stats-update"));
}