"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CalendarDays, Check, ChevronDown, ChevronUp, Plus, StickyNote, Trash2 } from "lucide-react";
import { useTimer } from "../context/TimerContext";
import { playTaskSound, sendTaskNotification } from "../utils/notifications";

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
const LAST_CHECK_KEY = "yaverfx-task-last-check";

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
  } catch {
    console.warn("Failed to save tasks to localStorage");
  }
}

// Check and notify for tasks that are due
async function checkAndNotifyTasks(tasks: Task[]): Promise<void> {
  if (typeof window === "undefined") return;
  
  const now = Date.now();
  const appName = localStorage.getItem("yaverfx-app-name") || "YaverFX";
  
  for (const task of tasks) {
    if (task.completed || !task.date || !task.time) continue;
    
    const taskDateTime = new Date(`${task.date}T${task.time}`).getTime();
    const timeDiff = now - taskDateTime;
    
    // If task is due within the last 2 minutes and we haven't notified recently
    if (timeDiff >= 0 && timeDiff < 120000) {
      // Check if we already notified for this task recently
      const notifiedKey = `yaverfx-task-notified-${task.id}`;
      const lastNotified = localStorage.getItem(notifiedKey);
      
      if (!lastNotified || (now - parseInt(lastNotified)) > 60000) {
        // Play sound
        playTaskSound();
        
        // Send notification
        await sendTaskNotification(task.text, task.emoji);
        
        // Mark as notified
        localStorage.setItem(notifiedKey, now.toString());
      }
    }
  }
  
  localStorage.setItem(LAST_CHECK_KEY, now.toString());
}

// Schedule notifications for upcoming tasks
function scheduleUpcomingTasks(tasks: Task[]): NodeJS.Timeout | null {
  if (typeof window === "undefined") return null;
  
  const now = Date.now();
  let nextTaskTime: number | null = null;
  let nextTask: Task | null = null;
  
  for (const task of tasks) {
    if (task.completed || !task.date || !task.time) continue;
    
    const taskDateTime = new Date(`${task.date}T${task.time}`).getTime();
    if (taskDateTime > now && (!nextTaskTime || taskDateTime < nextTaskTime)) {
      nextTaskTime = taskDateTime;
      nextTask = task;
    }
  }
  
  if (nextTaskTime && nextTask) {
    const delay = nextTaskTime - now;
    // Only schedule if it's within the next hour (to avoid scheduling too far ahead)
    if (delay < 3600000) {
      return setTimeout(() => {
        playTaskSound();
        sendTaskNotification(nextTask.text, nextTask.emoji);
      }, delay);
    }
  }
  
  return null;
}

interface TaskListProps {
  onTasksChange?: (tasks: Task[]) => void;
}

export default function TaskList({ onTasksChange }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState("📝");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const scheduledTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { updateStats } = useTimer();

  // Load tasks on mount
  useEffect(() => {
    const loadedTasks = loadTasks();
    setTasks(loadedTasks);
    setIsLoaded(true);
    
    // Check for any overdue tasks immediately
    checkAndNotifyTasks(loadedTasks);
    
    // Schedule upcoming task notifications
    if (scheduledTimeoutRef.current) {
      clearTimeout(scheduledTimeoutRef.current);
    }
    scheduledTimeoutRef.current = scheduleUpcomingTasks(loadedTasks);
    
    // Also check periodically (every minute)
    const checkInterval = setInterval(() => {
      const currentTasks = loadTasks();
      checkAndNotifyTasks(currentTasks);
    }, 60000);
    
    return () => {
      clearInterval(checkInterval);
      if (scheduledTimeoutRef.current) {
        clearTimeout(scheduledTimeoutRef.current);
      }
    };
  }, []);

  // Update schedule when tasks change
  useEffect(() => {
    if (scheduledTimeoutRef.current) {
      clearTimeout(scheduledTimeoutRef.current);
    }
    scheduledTimeoutRef.current = scheduleUpcomingTasks(tasks);
  }, [tasks]);

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
    if (!trimmed) {
      setInputError("Görev adı gerekli.");
      return;
    }

    setInputError(null);
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      emoji,
      time: time || undefined,
      date: date || undefined,
      note: note || undefined,
    };
    
    setTasks(prev => {
      const updated = [newTask, ...prev];
      saveTasks(updated);
      onTasksChange?.(updated);
      
      // Schedule notification for new task
      if (scheduledTimeoutRef.current) {
        clearTimeout(scheduledTimeoutRef.current);
      }
      scheduledTimeoutRef.current = scheduleUpcomingTasks(updated);
      
      return updated;
    });
    
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
      
      saveTasks(updated);
      onTasksChange?.(updated);
      return updated;
    });
  }, [updateStats]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveTasks(updated);
      onTasksChange?.(updated);
      return updated;
    });
  }, []);

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="task-wrapper animate-in">
      <div className="task-panel glass-card">
        <div className="task-panel-header">
          <div>
            <span className="page-eyebrow">Görev Panosu</span>
            <h2>Bugün neyi bitireceksin?</h2>
          </div>
          <div className="task-stats-chip">{completedCount} / {tasks.length || 0} tamamlandı</div>
        </div>

        <div className="task-input-container">
          <div className="task-input-main">
            <button className="emoji-select-btn" onClick={() => setShowDetails(!showDetails)} aria-label="Emoji seç">
              {emoji}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputError && e.target.value.trim()) {
                  setInputError(null);
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && addTaskCallback()}
              placeholder="Yeni ne başarmak istersin?"
              className={`task-input ${inputError ? "task-input-error" : ""}`}
              aria-invalid={inputError ? true : false}
              aria-describedby={inputError ? "task-input-error" : undefined}
            />
            <button onClick={() => setShowDetails(!showDetails)} className="task-expand-btn" aria-label="Detayları aç">
              {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <button onClick={addTaskCallback} className="task-add-btn" aria-label="Görev ekle">
              <Plus size={18} />
            </button>
          </div>

          {inputError && (
            <p id="task-input-error" className="task-input-feedback" role="alert">
              {inputError}
            </p>
          )}

          {showDetails && (
            <div className="task-details-form animate-in">
              <div className="emoji-picker" role="listbox" tabIndex={0} ref={emojiPickerRef} onKeyDown={handleEmojiKeyDown}>
                <div className="section-inline-label">
                  <span>Durum simgesi</span>
                </div>
                <div className="emoji-scroll">
                  {EMOJIS.map((currentEmoji) => (
                    <button
                      key={currentEmoji}
                      role="option"
                      aria-selected={emoji === currentEmoji}
                      onClick={() => setEmoji(currentEmoji)}
                      className={`emoji-btn ${emoji === currentEmoji ? "active" : ""}`}
                    >
                      {currentEmoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="task-datetime-row">
                <label className="task-field glass-inset">
                  <CalendarDays size={16} />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="task-detail-input" />
                </label>
                <label className="task-field glass-inset">
                  <CalendarDays size={16} />
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="task-detail-input" />
                </label>
              </div>

              <label className="task-note-field glass-inset">
                <StickyNote size={16} />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Görev için notlar..."
                  className="task-detail-input task-note-input"
                  rows={2}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="task-stats-bar glass-card">
          <span className="reward-label">{completedCount} / {tasks.length} TAMAMLANDI</span>
        </div>
      )}

      <div className="task-list">
        {!isLoaded && (
          <div className="task-empty glass-card">
            <div className="empty-icon">⋯</div>
            <p className="menu-label">YÜKLENİYOR...</p>
          </div>
        )}
        {isLoaded && tasks.length === 0 && (
          <div className="task-empty glass-card">
            <div className="empty-icon">+</div>
            <p className="menu-label">LİSTEYİ OLUŞTURMAYA BAŞLA</p>
          </div>
        )}
        {tasks.map((task) => (
          <div key={task.id} className={`task-item glass-card ${task.completed ? "completed" : ""}`}>
            <button
              onClick={() => toggleTask(task.id)}
              className={`task-checkbox ${task.completed ? "checked" : ""}`}
              aria-label={task.completed ? "Görevi geri al" : "Görevi tamamla"}
            >
              {task.completed && <Check size={15} strokeWidth={3} />}
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
                      <CalendarDays size={14} />
                      <span>{task.date} {task.time}</span>
                    </span>
                  )}
                  {task.note && <p className="task-note-text">{task.note}</p>}
                </div>
              )}
            </div>

            <button onClick={() => deleteTask(task.id)} className="task-delete-btn" aria-label="Görevi sil">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
