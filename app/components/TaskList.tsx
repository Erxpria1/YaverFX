"use client";

import { useState, useEffect } from "react";
import { useTimer } from "../context/TimerContext";

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

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  
  const { updateStats } = useTimer();

  useEffect(() => {
    const stored = localStorage.getItem("yaverfx-tasks");
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("yaverfx-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      { id: crypto.randomUUID(), text: trimmed, completed: false, emoji, time, date, note },
      ...prev
    ]);
    setInput("");
    setNote("");
    setTime("");
    setDate("");
    setShowDetails(false);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      const wasCompleted = prev.find(t => t.id === id)?.completed;
      const isNowCompleted = updated.find(t => t.id === id)?.completed;
      
      if (!wasCompleted && isNowCompleted) {
        updateStats({ points: 5, tasksDone: 1 });
      }
      return updated;
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

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
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Yeni ne başarmak istersin?"
            className="task-input"
          />
          <button onClick={() => setShowDetails(!showDetails)} className="task-expand-btn">
            {showDetails ? "▲" : "▼"}
          </button>
          <button onClick={addTask} className="task-add-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {showDetails && (
          <div className="task-details-form animate-in">
            <div className="emoji-picker">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)} className={`emoji-btn ${emoji === e ? 'active' : ''}`}>{e}</button>
              ))}
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
        {tasks.length === 0 && (
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
