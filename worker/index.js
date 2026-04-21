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
  let data = { title: "YaverFX", body: "Odaklanma zamanı!" };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    // If not JSON, try text
    if (event.data) {
      data.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: getNotificationIcon(),
      badge: getNotificationIcon(),
      tag: "yaverfx-notification",
      data: data.url || "/", 
      vibrate: [200, 100, 200, 100, 200],
      renotify: true, // 2026 standard for focus apps
      requireInteraction: true,
      silent: false,
      intermittent: true // Optimized for battery while keeping the alert alive
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
        requireInteraction: true
      })
    );
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
