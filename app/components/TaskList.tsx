"use client";

import { useState, useEffect, useRef } from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Load tasks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("yaverfx-tasks");
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("yaverfx-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const updateStats = (updates: any) => {
    try {
      const stored = localStorage.getItem("yaverfx-stats");
      const current = stored ? JSON.parse(stored) : { focusTime: 0, tasksDone: 0, streak: 0, points: 0 };
      const updated = { ...current, ...updates };
      localStorage.setItem("yaverfx-stats", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('yaverfx-stats-update'));
    } catch (e) {}
  };

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, completed: false },
    ]);
    setInput("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      
      // Check if any task was just completed
      const wasCompleted = prev.find(t => t.id === id)?.completed;
      const isNowCompleted = updated.find(t => t.id === id)?.completed;
      
      if (!wasCompleted && isNowCompleted) {
        // Task was just completed - award points
        const currentStats = JSON.parse(localStorage.getItem("yaverfx-stats") || '{"focusTime":0,"tasksDone":0,"streak":0,"points":0}');
        updateStats({
          tasksDone: currentStats.tasksDone + 1,
          points: currentStats.points + 5,
        });
      }
      
      return updated;
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addTask();
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="task-wrapper">
      <div className="task-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Yeni görev ekle..."
          className="task-input"
        />
        <button onClick={addTask} className="task-add-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 5v10M5 10h10" />
          </svg>
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="task-progress">
          <span>{completedCount} / {tasks.length} tamamlandı</span>
          <div className="task-progress-bar">
            <div 
              className="task-progress-fill" 
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div ref={listRef} className="task-list">
        {tasks.length === 0 && (
          <div className="task-empty">
            <span className="task-empty-icon">📝</span>
            <p>Henüz görev yok</p>
            <p className="task-empty-hint">Yukarıdan ekle!</p>
          </div>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? "completed" : ""}`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`task-checkbox ${task.completed ? "checked" : ""}`}
            >
              {task.completed && (
                <svg width="12" height="12" viewBox="0 0 20 20" fill="white">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <span className={`task-text ${task.completed ? "done" : ""}`}>
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="task-delete"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}