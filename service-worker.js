const CACHE_NAME = "piove-a-zagarolo-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./data.json",
  "./favicon.png",
  "./watermark-512x512.png",
  "./main.js",
  "./pwa-install.js",
  "./manifest.json",
  "./css/main.css",
  "./css/weather-icons.min.css",
  "./font/weathericons-regular-webfont.eot",
  "./font/weathericons-regular-webfont.svg",
  "./font/weathericons-regular-webfont.woff",
  "./font/weathericons-regular-webfont.woff2",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/chart.js"
];

self.addEventListener("install", event => {
  self.skipWaiting(); // Activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Do NOT cache data.json on install, it's dynamic
      const staticAssets = urlsToCache.filter(url => !url.includes("data.json"));
      return cache.addAll(staticAssets);
    })
  );
});

self.addEventListener("fetch", event => {
  // Stale-while-revalidate for data.json
  if (event.request.url.includes("data.json")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => cached);
        // Return cached first, then update in background
        return cached || fetchPromise;
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

self.addEventListener("activate", event => {
  self.clients.claim(); // Take control immediately
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});