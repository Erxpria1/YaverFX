const CACHE_VERSION = "v2-" + Date.now();
const CACHE_NAME = "yaverfx-cache-" + CACHE_VERSION;

// Skip waiting immediately on install
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Claim clients immediately on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy - always try network first
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip API and static Next.js paths for immediate fresh content
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache on network failure
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/");
        });
      })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "YaverFX", body: "Odaklanma zamanı!" };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/apple-touch-icon.png",
    })
  );
});