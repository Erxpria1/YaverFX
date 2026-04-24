"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  ChartNoAxesCombined,
  CheckSquare,
  ChevronRight,
  FileBarChart,
  Home,
  Menu,
  Palette,
  Settings,
  Siren,
  Sparkles,
  Trophy,
  X,
  SlidersHorizontal,
} from "lucide-react";
import PomodoroTimer from "./components/PomodoroTimer";
import TaskList from "./components/TaskList";
import SoundSettings from "./components/SoundSettings";
import RewardSystem from "./components/RewardSystem";
import ThemeSelector from "./components/ThemeSelector";
import EmergencyTimer from "./components/EmergencyTimer";
import PixelCompanion from "./components/PixelCompanion";
import PixelHero from "./components/PixelHero";
import SettingsPanel from "./components/SettingsPanel";
import ReportPanel from "./components/ReportPanel";
import { getAppName } from "./context/TimerContext";
import { calculateLevel, getCompanionForLevel } from "./utils/stats";
import {
  scheduleNotification,
  getScheduledNotifications,
  cancelNotification,
  type ScheduledNotification,
} from "./utils/scheduledNotifications";

type Theme = "modern" | "cyber" | "minimal" | "pixel";
type Page = "home" | "tasks" | "sounds" | "rewards" | "theme" | "emergency" | "reports" | "settings";

const STORAGE_KEY_TASKS = "yaverfx-tasks";

const MENU_ITEMS = [
  { id: "home", icon: Home, label: "Ana Ekran", detail: "Odak oturumu" },
  { id: "tasks", icon: CheckSquare, label: "Gorevler", detail: "Planlarini sirala" },
  { id: "sounds", icon: Settings, label: "Ses Ayarlar", detail: "Sesler ve hatirlatmalar" },
  { id: "rewards", icon: Trophy, label: "Oduller", detail: "Ilerleme ve puanlar" },
  { id: "theme", icon: Palette, label: "Tema", detail: "Gorunumu degistir" },
  { id: "emergency", icon: Siren, label: "Acil Durakla", detail: "Kisa nefes arasi" },
  { id: "reports", icon: FileBarChart, label: "Rapor", detail: "Istatistiklerini gor" },
  { id: "settings", icon: SlidersHorizontal, label: "Ayarlar", detail: "Zamanlayici ve otomatik baslatma" },
] as const;

interface Task {
  id: string;
  text: string;
  completed: boolean;
  emoji?: string;
  time?: string;
  date?: string;
  note?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [page, setPage] = useState<Page>("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [appName, setAppName] = useState(getAppName());
  const [currentTheme, setCurrentTheme] = useState<Theme>("modern");
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [points, setPoints] = useState(0);

  const tasksRef = useRef<Task[]>([]);
  tasksRef.current = tasks;

  const randomTask = tasksRef.current.filter((t) => !t.completed)[0];

  useEffect(() => {
    const applyTheme = () => {
      if (typeof window === "undefined") return;
      const t = localStorage.getItem("yaverfx-theme") as Theme;
      if (t && ["modern", "cyber", "minimal", "pixel"].includes(t)) {
        setCurrentTheme(t);
        document.documentElement.setAttribute("data-theme", t);
      }
    };

    const applyName = () => setAppName(getAppName());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "yaverfx-theme") applyTheme();
      if (event.key === "yaverfx-app-name") applyName();
    };

    applyTheme();
    applyName();
    window.addEventListener("yaverfx-theme-update", applyTheme);
    window.addEventListener("yaverfx-name-update", applyName);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("yaverfx-theme-update", applyTheme);
      window.removeEventListener("yaverfx-name-update", applyName);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Register Service Worker for background notifications
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});

    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "YAVERFX_CHECK_NOTIFS_FROM_SW") return;
      // SW woke up and asked us to check scheduled notifications
      const now = Date.now();
      const scheduled = getScheduledNotifications();
      const due = scheduled.filter((n) => n.fireAt <= now);
      if (due.length === 0) return;

      // Fire each due notification via Notification API
      due.forEach((notif) => {
        if (Notification.permission === "granted") {
          new Notification("YaverFX — Görev Zamani!", {
            body: notif.taskText,
            icon: `/characters/char_0.png`,
            tag: `yaverfx-task-${notif.id}`,
            requireInteraction: false,
          });
        }
        cancelNotification(notif.taskId);
      });
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  // Load stats for companion level
  useEffect(() => {
    const updateStats = () => {
      if (typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem("yaverfx-stats");
        if (stored) setPoints(Number(JSON.parse(stored).points) || 0);
      } catch {}
    };
    updateStats();
    window.addEventListener("yaverfx-stats-update", updateStats);
    return () => window.removeEventListener("yaverfx-stats-update", updateStats);
  }, []);

  // Load tasks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TASKS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (t: Task) =>
              typeof t.id === "string" &&
              typeof t.text === "string" &&
              typeof t.completed === "boolean"
          );
          setTasks(valid);
        }
      }
    } catch {}
    setTasksLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const level = calculateLevel(points);
  const currentCompanion = getCompanionForLevel(level);
  const currentItem = MENU_ITEMS.find((item) => item.id === page) ?? MENU_ITEMS[0];

  const renderPage = () => {
    switch (page) {
      case "home":
        return <PomodoroTimer />;
      case "tasks":
        return <div className="page-container animate-in"><TaskList onTasksChange={setTasks} /></div>;
      case "sounds":
        return <div className="page-container animate-in"><SoundSettings /></div>;
      case "rewards":
        return <div className="page-container animate-in"><RewardSystem /></div>;
      case "theme":
        return <div className="page-container animate-in"><ThemeSelector /></div>;
      case "emergency":
        return <div className="page-container animate-in"><EmergencyTimer /></div>;
      case "reports":
        return <div className="page-container animate-in"><ReportPanel /></div>;
      case "settings":
        return <div className="page-container animate-in"><SettingsPanel /></div>;
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient-mesh" aria-hidden="true" />

      <div className="app">
        <header className="top-bar">
          <div className="top-bar-copy">
            <span className="top-bar-kicker">Focus OS</span>
            <h1>{appName}</h1>
          </div>

          <div className="top-bar-chip">
            <Sparkles size={14} />
            <span>{currentItem.label}</span>
          </div>
        </header>

        <main className="main-stage">
          <section className="content-shell">
            {page !== "home" && (
              <div className="page-intro animate-in">
                <span className="page-eyebrow">{currentItem.label}</span>
                <p className="page-description">{currentItem.detail}</p>
              </div>
            )}
            {renderPage()}
          </section>
        </main>

        {isMenuOpen && (
          <div
            className={`menu-overlay ${isMenuOpen ? "active" : ""}`}
            onClick={() => { setIsMenuOpen(false); }}
            aria-hidden={!isMenuOpen}
          >
            <div className="menu-sheet" onClick={(event) => event.stopPropagation()}>
              <div className="menu-sheet-handle" />
              <div className="menu-sheet-header">
                <div>
                  <span className="page-eyebrow">Gezinme</span>
                  <h2>YaverFX Alanlari</h2>
                </div>
                <button
                  className="menu-settings-btn"
                  onClick={(e) => { e.stopPropagation(); setPage("sounds"); setIsMenuOpen(false); }}
                  aria-label="Ayarlar"
                >
                  <Settings size={18} />
                </button>
              </div>

              {randomTask && (
                <div className="sirada-hero-wrapper" onClick={() => { setPage("tasks"); setIsMenuOpen(false); }}>
                  <PixelHero
                    theme={currentTheme}
                    task={randomTask.text}
                    size={100}
                  />
                </div>
              )}

              <div className="menu-grid">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`menu-item ${page === item.id ? "active" : ""}`}
                      onClick={() => {
                        if (item.id === "reports") {
                          router.push("/reports");
                          setIsMenuOpen(false);
                        } else {
                          setPage(item.id as Page);
                          setIsMenuOpen(false);
                        }
                      }}
                    >
                      <span className="menu-icon">
                        <Icon size={22} />
                      </span>
                      <span className="menu-label">{item.label}</span>
                      <span className="menu-detail">{item.detail}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <button
          className={`fab-main ${isMenuOpen ? "open" : "breathing"}`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Menuyu kapat" : "Menuyu ac"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </div>
  );
}
