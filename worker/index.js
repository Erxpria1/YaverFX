// Character images for notifications
let notificationCharacterIndex = 0;

self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SET_CHARACTER_INDEX") {
    notificationCharacterIndex = event.data.index || 0;
  }

  // Wake up and check scheduled notifications
  if (event.data.type === "YAVERFX_CHECK_NOTIFICATIONS") {
    checkScheduledNotifications();
  }
});

function getNotificationIcon() {
  return `/characters/char_${notificationCharacterIndex}.png`;
}

// Check scheduled notifications from localStorage
async function checkScheduledNotifications() {
  try {
    // Get all clients to access localStorage via message to page
    const clients = await self.clients.matchAll({ type: "window" });
    if (clients.length === 0) {
      // No open tabs — try to show notification directly
      // Note: this is limited by browser throttling
      return;
    }
    // Ask the page to check and respond with notifications to fire
    clients.forEach((client) => {
      client.postMessage({ type: "YAVERFX_CHECK_NOTIFS_FROM_SW" });
    });
  } catch (e) {
    console.warn("[SW] Failed to check notifications:", e);
  }
}

// Periodic notification check — fires every 30 seconds when SW is active
let checkIntervalId = null;

function startPeriodicCheck() {
  if (checkIntervalId) return;
  checkIntervalId = setInterval(() => {
    checkScheduledNotifications();
  }, 30_000);
}

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  startPeriodicCheck();
});

self.addEventListener("install", (event) => {
  self.skipWaiting();
  startPeriodicCheck();
});

// Push notification handler
self.addEventListener("push", (event) => {
  let data = { title: "YaverFX", body: "Odaklanma zamanı!" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: getNotificationIcon(),
      badge: getNotificationIcon(),
      tag: "yaverfx-notification",
      data: data.url || "/",
      vibrate: [200, 100, 200, 100, 200],
      renotify: true,
      requireInteraction: true,
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
        requireInteraction: true,
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
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    })
  );
});
