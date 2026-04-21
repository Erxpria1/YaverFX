// Centralized stats utilities — use these instead of duplicating loadStats/saveStats

export const POINTS_PER_LEVEL = 100;

export interface StoredStats {
  focusTime: number;
  tasksDone: number;
  streak: number;
  points: number;
}

const STATS_KEY = "yaverfx-stats";
const APP_NAME_KEY = "yaverfx-app-name";
const DEFAULT_STATS: StoredStats = { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };
const DEFAULT_APP_NAME = "Kerem";

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