const CACHE = "nakafitness-v8";
const ASSETS = ["./","./index.html","./manifest.json"];
let timerTimeout = null;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchProm = fetch(e.request).then(res => {
        if(res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchProm;
    })
  );
});

self.addEventListener("message", e => {
  if(!e.data) return;
  if(e.data.type === "TIMER") {
    if(timerTimeout) clearTimeout(timerTimeout);
    const delay = Math.max(0, e.data.endTime - Date.now());
    timerTimeout = setTimeout(() => {
      self.registration.showNotification("NakaFitness \u2014 Repos termin\u00e9 !", {
        body: e.data.msg || "Reprends ton exercice \ud83d\udcaa",
        icon: "./icon-192.png",
        badge: "./icon-192.png",
        vibrate: [200,100,200,100,400],
        tag: "rest-timer",
        renotify: true
      });
    }, delay);
  }
  if(e.data.type === "TIMER_CANCEL") {
    if(timerTimeout) clearTimeout(timerTimeout);
  }
});
