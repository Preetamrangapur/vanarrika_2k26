// ============================================================
// Service Worker — RANGOTSAVA PWA
// ============================================================

const CACHE_NAME = 'rangotsava-v3-responsive';
const ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/admin.html',
  '/teacher.html',
  '/student.html',
  '/event.html',
  '/register.html',
  '/styles/main.css',
  '/styles/dashboard.css',
  '/styles/login.css',
  '/js/data.js',
  '/js/auth.js',
  '/js/nav.js',
  '/js/admin.js',
  '/js/teacher.js',
  '/js/student.js',
  '/js/event-detail.js',
  '/js/login.js',
  '/js/dashboard-nav.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
