const CACHE = "nakafitness-v5";
const ASSETS = ["./", "./index.html"];
let timerTimeout = null;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).catch(() => caches.match("./index.html")))
  );
});

// Background timer notification
self.addEventListener("message", e => {
  if (e.data.type === "TIMER") {
    if (timerTimeout) clearTimeout(timerTimeout);
    const delay = Math.max(0, e.data.endTime - Date.now());
    timerTimeout = setTimeout(() => {
      self.registration.showNotification("NakaFitness — Repos terminé !", {
        body: e.data.msg || "Reprends ton exercice ! 💪",
        icon: "./icon-192.png",
        badge: "./icon-192.png",
        vibrate: [200, 100, 200, 100, 400],
        tag: "rest-timer",
        renotify: true,
        requireInteraction: false
      });
    }, delay);
  }
  if (e.data.type === "TIMER_CANCEL") {
    if (timerTimeout) clearTimeout(timerTimeout);
  }
});
