export interface Task {
  id: string;
  text: string;
  completed: boolean;
  emoji?: string;
  time?: string;
  date?: string;
  note?: string;
}

const STORAGE_KEY = "yaverfx-tasks";

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
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

export function quickAddTask(text: string, emoji: string = "📝", time: string = "", date: string = "", note: string = "") {
  const newTask: Task = { 
    id: crypto.randomUUID(), 
    text, 
    completed: false, 
    emoji, 
    time, 
    date, 
    note 
  };
  const current = loadTasks();
  saveTasks([newTask, ...current]);
  
  // Trigger update event
  window.dispatchEvent(new CustomEvent("yaverfx-tasks-update"));
}