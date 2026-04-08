export function requestNotificationPermission() {
  if (typeof window === "undefined") return;
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function sendBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}
