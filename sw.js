const CACHE='thiathie-v3';
const ASSETS=['./','./nakafitness.html','./thiathie_stocks.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match(e.request)));
});
let timer=null;
self.addEventListener('message',ev=>{
  const {type,endAt,label}=ev.data||{};
  if(type==='TIMER_SET'){
    if(timer)clearTimeout(timer);
    const ms=endAt-Date.now();
    if(ms<=0)return;
    timer=setTimeout(()=>{
      self.registration.showNotification('NakaFitness',{body:label||'Temps écoulé',vibrate:[200,100,200],tag:'rest',icon:'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 64 64\'%3E%3Crect width=\'64\' height=\'64\' rx=\'14\' fill=\'%23ff3b3b\'/%3E%3C/svg%3E'});
    },ms);
  }
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>cs[0]?cs[0].focus():self.clients.openWindow('./')))});
