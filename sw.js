const BASE=new URL('./',self.location.href);
const CACHE='mistock-main-shell-v2';
const SHELL=['index.html','app.css','app.js','api.js','config.json','manifest.webmanifest','base.css','logo.svg','icon-180.png','icon-192.png','icon-512.png','privacidad.html'].map(path=>new URL(path,BASE).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mistock-main-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 const isHome=url.pathname===BASE.pathname||url.pathname===new URL('index.html',BASE).pathname;
 if(event.request.mode==='navigate'&&isHome){event.respondWith(fetch(event.request).catch(()=>caches.match(new URL('index.html',BASE).href)));return;}
 if(!SHELL.includes(url.href))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(url.href,copy)));}return response;}).catch(()=>caches.match(url.href)));
});
