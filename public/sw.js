const CACHE_NAME = "yaverfx-cache-v1";
const urlsToCache = ["/", "/manifest.json", "/favicon.ico", "/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "YaverFX", body: "Odaklanma zamanı!" };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/apple-touch-icon.png",
      badge: "/apple-touch-icon.png",
    })
  );
});
