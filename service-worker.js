// ============================================================
// Service Worker — CampusVibe PWA
// ============================================================

const CACHE_NAME = 'campusvibe-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/admin.html',
  '/teacher.html',
  '/student.html',
  '/event.html',
  '/venues.html',
  '/profile.html',
  '/faq.html',
  '/styles/main.css',
  '/js/data.js',
  '/js/auth.js',
  '/js/nav.js',
  '/js/home.js',
  '/js/admin.js',
  '/js/teacher.js',
  '/js/student.js',
  '/js/event-detail.js',
  '/js/venues.js',
  '/js/profile.js',
  '/js/faq.js',
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
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
