"use client";

import { useState } from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

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
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addTask();
  };

  const accent = "var(--theme-accent)";
  const text = "var(--theme-text)";
  const secondary = "var(--theme-secondary)";
  const border = "var(--theme-border)";

  return (
    <div className="flex flex-col gap-4 w-full px-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Görev ekle..."
          className="flex-1 rounded-full px-4 py-3 text-base outline-none min-h-44"
          style={{ 
            backgroundColor: secondary, 
            border: `1px solid ${border}`,
            color: text,
          }}
        />
        <button
          onClick={addTask}
          className="px-6 py-3 rounded-full font-semibold min-h-44"
          style={{ backgroundColor: accent, color: "#fff" }}
        >
          Ekle
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
        {tasks.length === 0 && (
          <p className="text-center py-8" style={{ color: text, opacity: 0.5 }}>
            Henüz görev yok. Yukarıdan ekle!
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ 
              backgroundColor: secondary, 
              border: `1px solid ${border}`,
            }}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center min-h-44"
              style={{ 
                borderColor: task.completed ? accent : border,
                backgroundColor: task.completed ? `${accent}20` : "transparent",
              }}
            >
              {task.completed && (
                <svg width="14" height="14" viewBox="0 0 20 20" fill={accent}>
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <span
              className="flex-1 text-base"
              style={{ 
                color: task.completed ? text : text,
                opacity: task.completed ? 0.5 : 1,
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-2 min-h-44 min-w-44 flex items-center justify-center"
              style={{ color: text, opacity: 0.5 }}
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
