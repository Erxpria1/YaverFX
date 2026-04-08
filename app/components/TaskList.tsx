"use client";

import { useState, useEffect, useRef } from "react";
import { useTimer } from "../context/TimerContext";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const { updateStats } = useTimer();

  useEffect(() => {
    const stored = localStorage.getItem("yaverfx-tasks");
    if (stored) {
      try {
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
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), text: trimmed, completed: false }]);
    setInput("");
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
      <div className="task-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Yeni ne başarmak istersin?"
          className="task-input"
        />
        <button onClick={addTask} className="task-add-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
            <span className="task-text">{task.text}</span>
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
