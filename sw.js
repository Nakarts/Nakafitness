const C='thia-naka-v8';
const A=['./','./thiathie_stocks.html','./nakafitness.html','./manifest.json'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp).catch(()=>{}));return r}).catch(()=>caches.match(e.request)));
});
let timerId=null;
self.addEventListener('message',e=>{
  if(e.data?.type==='TIMER_SET'){
    if(timerId)clearTimeout(timerId);
    const ms=Math.max(0,e.data.endAt-Date.now());
    timerId=setTimeout(()=>{
      self.registration.showNotification('⏱️ Repos terminé',{body:'Prochaine série !',vibrate:[300,150,300,150,300],tag:'rest',renotify:true,silent:false});
    },ms);
  }
  if(e.data?.type==='TIMER_CANCEL'){if(timerId)clearTimeout(timerId);timerId=null}
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>cs[0]?cs[0].focus():self.clients.openWindow('./')))});
