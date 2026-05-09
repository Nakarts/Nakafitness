const C='thia-naka-v6';
const A=['./','./thiathie_stocks.html','./nakafitness.html','./manifest.json'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp).catch(()=>{}));return r}).catch(()=>caches.match(e.request)));
});
self.addEventListener('message',e=>{
  if(e.data?.type==='TIMER_SET'){
    const ms=Math.max(0,e.data.endAt-Date.now());
    setTimeout(()=>{self.registration.showNotification('Repos terminé',{body:'Prochaine série !',icon:'',vibrate:[200,100,200],tag:'rest'})},ms);
  }
});
