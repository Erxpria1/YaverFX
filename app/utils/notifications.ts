export function requestNotificationPermission(): Promise<NotificationPermission | "default"> {
  if (typeof window === "undefined") return Promise.resolve("default");
  if (!("Notification" in window)) return Promise.resolve("default");
  
  // If already granted or denied, return current status
  if (Notification.permission !== "default") {
    return Promise.resolve(Notification.permission);
  }
  
  // Request permission
  return Notification.requestPermission();
}

export function sendBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  
  // Only send if permission is granted
  if (Notification.permission === "granted") {
    new Notification(title, { 
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "yaverfx-notification",
      requireInteraction: false
    });
  }
}