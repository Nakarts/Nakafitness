/* NakaFitness Service Worker — cache app-shell + background timer notifications */
const CACHE = 'nakafit-v1';
const ASSETS = ['./nakafitness.html', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});

/* Background timer */
let timerId = null;
self.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.type === 'TIMER') {
    if (timerId) clearTimeout(timerId);
    const delay = Math.max(0, (data.endTime || 0) - Date.now());
    timerId = setTimeout(() => {
      self.registration.showNotification('NakaFitness', {
        body: data.msg || 'Repos terminé 💪',
        icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="42" fill="%230a0a0a"/><text x="50%25" y="54%25" text-anchor="middle" dominant-baseline="middle" font-family="Arial Black" font-size="90" font-weight="900" fill="%23D4FF3C">NF</text></svg>',
        badge: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="%23D4FF3C"/></svg>',
        vibrate: [200, 100, 200, 100, 400],
        tag: 'naka-timer',
        renotify: true,
        requireInteraction: false
      });
      timerId = null;
    }, delay);
  } else if (data.type === 'TIMER_CANCEL') {
    if (timerId) { clearTimeout(timerId); timerId = null; }
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./nakafitness.html');
    })
  );
});
