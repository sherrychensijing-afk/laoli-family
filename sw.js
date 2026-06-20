const CACHE_NAME = 'laoli-v2.0';
const ASSETS = ['/', '/css/style.css', '/js/api.js', '/js/app.js', '/js/dashboard.js', '/js/schedule.js', '/js/rules.js', '/js/messages.js', '/js/photos.js', '/manifest.json'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
