// Incrementare CACHE_NAME per forzare l'installazione di un nuovo Service Worker
const CACHE_NAME = "piove-a-zagarolo-cache-v16";
const urlsToCache = [
  "./",
  "./index.html",
  "./favicon.png",
  "./watermark-512x512.png",
  "./js/main.js",
  "./js/modules/constants.js",
  "./js/modules/cache.js",
  "./js/modules/icons.js",
  "./js/modules/charts.js",
  "./js/modules/ui.js",
  "./js/modules/precipitation.js",
  "./js/modules/air-quality.js",
  "./js/modules/debug-mobile.js",
  "./js/pwa-install.js",
  "./manifest.json",
  "./css/main.css",
  "./css/weather-icons.min.css",
  "./vendor/bootstrap/bootstrap.min.css",
  "./vendor/bootstrap/bootstrap.bundle.min.js",
  "./vendor/chart/chart.umd.min.js",
  "./font/weathericons-regular-webfont.eot",
  "./font/weathericons-regular-webfont.svg",
  "./font/weathericons-regular-webfont.woff",
  "./font/weathericons-regular-webfont.woff2",
  "./data.json",
  "./data-precipitations.json",
  "./package.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;

  // Navigazioni HTML: Network first con fallback cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(c => c.put('./', copy));
          return response;
        })
        .catch(() => caches.match('./') || caches.match('index.html'))
    );
    return;
  }

  // API dinamica data.json e data-precipitations.json: Stale-While-Revalidate
  if (request.url.includes('data.json') || request.url.includes('data-precipitations.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then(resp => {
            cache.put(request, resp.clone());
            return resp;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  // Static assets: Cache first fallback network
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});

self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(name => !cacheWhitelist.includes(name) && caches.delete(name))
    )).then(() => self.clients.claim())
  );
});

// Aggiornamento controllato dal client
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
