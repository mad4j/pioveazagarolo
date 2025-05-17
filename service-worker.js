const CACHE_NAME = 'meteo-zagarolo-v1';
const DYNAMIC_CACHE = 'meteo-dynamic-v1';

// Risorse da mettere in cache subito durante l'installazione
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png',
  '/css/weather-icons.min.css',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Installazione del Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installazione in corso');
  
  // Attendi che tutte le risorse siano in cache
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching dei file necessari');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Installato e cache inizializzata');
        return self.skipWaiting(); // Forza l'attivazione immediata
      })
  );
});

// Attivazione del Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Attivazione in corso');
  
  // Pulisci vecchie cache
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
          console.log('[Service Worker] Rimozione vecchia cache:', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[Service Worker] Attivato');
      return self.clients.claim(); // Prendi il controllo dei client
    })
  );
});

// Gestisci le richieste di rete
self.addEventListener('fetch', event => {
  // Strategia: Cache First, poi Network con aggiornamento della cache
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se la risorsa è in cache, restituiscila
        if (cachedResponse) {
          // Per i dati meteo, controlla anche la rete per aggiornamenti
          if (event.request.url.includes('data.json')) {
            // Fallback alla cache, ma aggiorna per le prossime visite
            fetch(event.request)
              .then(response => {
                // Aggiorna la cache con la nuova risposta
                if (response.ok) {
                  const clonedResponse = response.clone();
                  caches.open(DYNAMIC_CACHE).then(cache => {
                    cache.put(event.request, clonedResponse);
                  });
                }
              });
          }
          return cachedResponse;
        }

        // Altrimenti, fai la richiesta alla rete
        return fetch(event.request)
          .then(response => {
            // Se la risposta non è valida, restituiscila direttamente
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la risposta perché body può essere consumato solo una volta
            const responseToCache = response.clone();

            // Aggiungi la risposta alla cache dinamica
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(err => {
            // Se la richiesta fallisce (es. offline) e stiamo cercando una pagina
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // Se stiamo cercando i dati meteo e siamo offline
            if (event.request.url.includes('data.json')) {
              return caches.match(event.request);
            }
          });
      })
  );
});

// Gestisci i messaggi dal client (es. per forzare gli aggiornamenti)
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});