const CACHE_NAME = 'aiverse-v1.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/animations.css',
  './js/config.js',
  './js/audio.js',
  './js/board.js',
  './js/chess-agent.js',
  './js/bot-ai.js',
  './js/multiplayer.js',
  './js/levels.js',
  './js/certs.js',
  './js/codex.js',
  './js/exam-questions.js',
  './js/exam-engine.js',
  './js/app.js',
  './lib/jspdf.umd.min.js',
  './lib/confetti.browser.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching game assets...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[ServiceWorker] Optional asset cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through WebSocket and API endpoints
  if (event.request.url.includes('/ws') || event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
