// Character images for notifications (will be set from main app)
let notificationCharacterIndex = 0;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SET_CHARACTER_INDEX") {
    notificationCharacterIndex = event.data.index || 0;
  }
});

function getNotificationIcon() {
  return `/characters/char_${notificationCharacterIndex}.png`;
}

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "YaverFX", body: "Odaklanma zamanı!" };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: getNotificationIcon(),
      badge: getNotificationIcon(),
      tag: "yaverfx-notification",
      requireInteraction: data.requireInteraction !== undefined ? data.requireInteraction : false,
      silent: false
    })
  );
});

// Background sync for timer notifications
self.addEventListener("sync", (event) => {
  if (event.tag === "yaverfx-timer-complete") {
    event.waitUntil(
      self.registration.showNotification("YaverFX", {
        body: "Zamanlayıcı tamamlandı!",
        icon: getNotificationIcon(),
        badge: getNotificationIcon(),
        tag: "yaverfx-timer-notification",
        requireInteraction: false
      })
    );
  }
  // Handle periodic task notification sync
  if (event.tag === "yaverfx-task-notify") {
    event.waitUntil(
      self.registration.showNotification("YaverFX - Görev Zamanı!", {
        body: "Sırada bekleyen görevlerin var!",
        icon: getNotificationIcon(),
        badge: getNotificationIcon(),
        tag: "yaverfx-task-notification",
        requireInteraction: true
      })
    );
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
