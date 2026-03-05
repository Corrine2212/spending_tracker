// ── Allowance Tracker Service Worker ──
// Cache-first strategy: serves from cache instantly, updates in background

const CACHE_NAME = 'allowance-tracker-v1';

// Files to cache on install
const PRECACHE_URLS = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'
];

// ── Install: pre-cache all core assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local files strictly, fonts with fallback
      const localFiles = PRECACHE_URLS.filter(u => !u.startsWith('http'));
      const externalFiles = PRECACHE_URLS.filter(u => u.startsWith('http'));

      return Promise.all([
        cache.addAll(localFiles),
        ...externalFiles.map(url =>
          cache.add(url).catch(() => {
            // External resource failed (offline during install) — not fatal
            console.warn('[SW] Could not cache:', url);
          })
        )
      ]);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first, fall back to network ──
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Serve from cache, refresh in background
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {/* offline, no update */});

        return cachedResponse;
      }

      // Not in cache — fetch from network and cache it
      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // Offline and not cached — return offline fallback for HTML
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
    })
  );
});
