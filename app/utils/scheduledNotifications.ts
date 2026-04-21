/**
 * Background Notification Scheduler
 *
 * Works when app is CLOSED using the Service Worker:
 * 1. When user schedules a task notification → stored in localStorage
 * 2. Service Worker wakes up every 30s via setInterval
 * 3. Checks if any notification is due → shows browser notification
 *
 * Limitation: Service Workers get throttled when all tabs are closed
 * on some browsers. For best results, keep one tab open or use PWA installed mode.
 */

const SCHEDULED_NOTIFS_KEY = "yaverfx-scheduled-notifications";

export interface ScheduledNotification {
  id: string;
  taskId: string;
  taskText: string;
  fireAt: number; // Unix timestamp ms
  type: "task_reminder";
}

export function getScheduledNotifications(): ScheduledNotification[] {
  try {
    const raw = localStorage.getItem(SCHEDULED_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function scheduleNotification(
  taskId: string,
  taskText: string,
  fireAtMs: number
): ScheduledNotification {
  const existing = getScheduledNotifications();
  // Remove old entries for this task
  const filtered = existing.filter((n) => n.taskId !== taskId);
  const notif: ScheduledNotification = {
    id: `notif-${taskId}-${fireAtMs}`,
    taskId,
    taskText,
    fireAt: fireAtMs,
    type: "task_reminder",
  };
  const updated = [...filtered, notif];
  localStorage.setItem(SCHEDULED_NOTIFS_KEY, JSON.stringify(updated));

  // Tell service worker to wake up and check
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "YAVERFX_CHECK_NOTIFICATIONS",
    });
  }

  return notif;
}

export function cancelNotification(taskId: string): void {
  const existing = getScheduledNotifications();
  const updated = existing.filter((n) => n.taskId !== taskId);
  localStorage.setItem(SCHEDULED_NOTIFS_KEY, JSON.stringify(updated));
}

export function cancelAllNotifications(): void {
  localStorage.setItem(SCHEDULED_NOTIFS_KEY, "[]");
}
