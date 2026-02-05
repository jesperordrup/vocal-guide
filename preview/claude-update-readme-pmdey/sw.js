const CACHE_NAME = 'vocal-guide-v9';
const ASSETS = [
  '/vocal-guide/preview/claude-update-readme-pmdey/',
  '/vocal-guide/preview/claude-update-readme-pmdey/index.html',
  '/vocal-guide/preview/claude-update-readme-pmdey/styles.css',
  '/vocal-guide/preview/claude-update-readme-pmdey/manifest.json',
  '/vocal-guide/preview/claude-update-readme-pmdey/icons/icon-192.png',
  '/vocal-guide/preview/claude-update-readme-pmdey/icons/icon-512.png',
  '/vocal-guide/preview/claude-update-readme-pmdey/icons/icon.svg',
  '/vocal-guide/preview/claude-update-readme-pmdey/og-image.svg'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (like YouTube embeds)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Return offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/vocal-guide/preview/claude-update-readme-pmdey/index.html');
        }
      })
  );
});
