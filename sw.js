const CACHE_NAME = 'toko-kelontong-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './admin.html',
  './style.css',
  './app-common.js',
  './app.js',
  './admin.js',
  './config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Shell app dari cache (biar cepat & bisa dibuka offline), data toko tetap
// selalu diambil langsung dari Supabase (butuh koneksi internet).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
