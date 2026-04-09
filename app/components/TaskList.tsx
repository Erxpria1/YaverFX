"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTimer, getAppName, setAppName } from "../context/TimerContext";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  emoji?: string;
  time?: string;
  date?: string;
  note?: string;
}

const EMOJIS = ["📝", "🎯", "⚡", "💡", "📞", "🛒", "🏃", "💻", "📚", "🎨", "🔥", "🧘"];
const STORAGE_KEY = "yaverfx-tasks";

function validateTasks(data: unknown): data is Task[] {
  if (!Array.isArray(data)) return false;
  return data.every(task => 
    typeof task === "object" &&
    task !== null &&
    typeof task.id === "string" &&
    typeof task.text === "string" &&
    typeof task.completed === "boolean"
  );
}

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (validateTasks(parsed)) {
        return parsed;
      }
    }
  } catch {
    console.warn("Failed to load tasks from localStorage");
  }
  return [];
}

function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    scheduleTaskNotifications(tasks);
  } catch {
    console.warn("Failed to save tasks to localStorage");
  }
}

function scheduleTaskNotifications(tasks: Task[]) {
  if (typeof window === "undefined") return;
  
  // Clear existing task notification timeout
  const existingTimeout = localStorage.getItem("yaverfx-task-notif-timeout");
  if (existingTimeout) {
    clearTimeout(parseInt(existingTimeout));
  }
  
  const now = Date.now();
  let nextNotificationTime: number | null = null;
  
  for (const task of tasks) {
    if (task.date && task.time) {
      const taskDateTime = new Date(`${task.date}T${task.time}`).getTime();
      if (taskDateTime > now && (!nextNotificationTime || taskDateTime < nextNotificationTime)) {
        nextNotificationTime = taskDateTime;
      }
    }
  }
  
  if (nextNotificationTime) {
    const delay = nextNotificationTime - now;
    const timeoutId = setTimeout(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allTasks: Task[] = JSON.parse(stored);
        const appName = localStorage.getItem("yaverfx-app-name") || "YaverFX";
        
        for (const task of allTasks) {
          if (task.date && task.time) {
            const taskDateTime = new Date(`${task.date}T${task.time}`).getTime();
            const timeDiff = Math.abs(Date.now() - taskDateTime);
            if (timeDiff < 60000) { // Within 1 minute
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`${appName} - Görev Zamanı!`, {
                  body: `${task.emoji || "📝"} ${task.text}`,
                  icon: "/apple-touch-icon.png"
                });
              }
            }
          }
        }
      }
    }, delay);
    
    localStorage.setItem("yaverfx-task-notif-timeout", timeoutId.toString());
  }
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const { updateStats } = useTimer();

  // Load tasks only on client side to avoid hydration mismatch
  useEffect(() => {
    setTasks(loadTasks());
    setIsLoaded(true);
  }, []);

  // Emoji picker keyboard navigation
  const handleEmojiKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = EMOJIS.indexOf(emoji);
    let newIndex = currentIndex;

    switch(e.key) {
      case "ArrowRight":
        e.preventDefault();
        newIndex = (currentIndex + 1) % EMOJIS.length;
        break;
      case "ArrowLeft":
        e.preventDefault();
        newIndex = (currentIndex - 1 + EMOJIS.length) % EMOJIS.length;
        break;
      case "ArrowDown":
        e.preventDefault();
        newIndex = Math.min(currentIndex + 4, EMOJIS.length - 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        newIndex = Math.max(currentIndex - 4, 0);
        break;
      case "Tab":
        // Allow default tab behavior but scroll into view
        setTimeout(() => {
          const active = document.activeElement;
          if (active?.classList.contains('emoji-btn')) {
            active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }, 0);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        return;
      default:
        return;
    }
    
    setEmoji(EMOJIS[newIndex]);
    setTimeout(() => {
      const buttons = emojiPickerRef.current?.querySelectorAll('.emoji-btn');
      buttons?.[newIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 0);
  };

  const addTaskCallback = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks(prev => [
      { id: crypto.randomUUID(), text: trimmed, completed: false, emoji, time, date, note },
      ...prev
    ]);
    setInput("");
    setNote("");
    setTime("");
    setDate("");
    setShowDetails(false);
  }, [input, emoji, time, date, note]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      const wasCompleted = prev.find(t => t.id === id)?.completed;
      const isNowCompleted = updated.find(t => t.id === id)?.completed;
      
      if (!wasCompleted && isNowCompleted) {
        updateStats({ points: 5, tasksDone: 1 });
      }
      return updated;
    });
  }, [updateStats]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="task-wrapper animate-in">
      <div className="task-input-container">
        <div className="task-input-main">
          <button className="emoji-select-btn" onClick={() => setShowDetails(!showDetails)}>
            {emoji}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTaskCallback()}
            placeholder="Yeni ne başarmak istersin?"
            className="task-input"
          />
          <button onClick={() => setShowDetails(!showDetails)} className="task-expand-btn">
            {showDetails ? "▲" : "▼"}
          </button>
          <button onClick={addTaskCallback} className="task-add-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {showDetails && (
          <div className="task-details-form animate-in">
            <div className="emoji-picker" role="listbox" tabIndex={0} ref={emojiPickerRef} onKeyDown={handleEmojiKeyDown}>
              <div className="emoji-scroll">
                {EMOJIS.map(e => (
                  <button 
                    key={e} 
                    role="option"
                    aria-selected={emoji === e}
                    onClick={() => setEmoji(e)} 
                    className={`emoji-btn ${emoji === e ? 'active' : ''}`}
                  >{e}</button>
                ))}
              </div>
            </div>
            <div className="task-datetime-row">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="task-detail-input" />
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="task-detail-input" />
            </div>
            <textarea 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              placeholder="Görev için notlar..." 
              className="task-detail-input task-note-input"
              rows={2}
            />
          </div>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="task-stats-bar">
          <span className="reward-label">{completedCount} / {tasks.length} TAMAMLANDI</span>
        </div>
      )}

      <div className="task-list">
        {!isLoaded && (
          <div className="task-empty">
            <span style={{ fontSize: '40px', marginBottom: '12px', display: 'block' }}>✨</span>
            <p className="menu-label">YÜKLENİYOR...</p>
          </div>
        )}
        {isLoaded && tasks.length === 0 && (
          <div className="task-empty">
            <span style={{ fontSize: '40px', marginBottom: '12px', display: 'block' }}>✨</span>
            <p className="menu-label">LİSTEYİ OLUŞTURMAYA BAŞLA</p>
          </div>
        )}
        {tasks.map((task) => (
          <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
            <button
              onClick={() => toggleTask(task.id)}
              className={`task-checkbox ${task.completed ? "checked" : ""}`}
            >
              {task.completed && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--btn-text)" strokeWidth="4">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
            <div className="task-content">
              <div className="task-header-row">
                <span className="task-emoji">{task.emoji || "📝"}</span>
                <span className="task-text">{task.text}</span>
              </div>
              {(task.date || task.time || task.note) && (
                <div className="task-meta">
                  {(task.date || task.time) && (
                    <span className="task-datetime-badge">
                      🗓 {task.date} {task.time}
                    </span>
                  )}
                  {task.note && <p className="task-note-text">{task.note}</p>}
                </div>
              )}
            </div>
            <button onClick={() => deleteTask(task.id)} className="task-delete-btn">
              <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
