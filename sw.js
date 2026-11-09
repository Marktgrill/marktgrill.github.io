// Marktgrill Service Worker: Netzwerk zuerst, robuster Cache
const V = 'marktgrill-v4';
const ASSETS = [
  './',
  './index.html',
  './speisekarte.html',
  './tagesgericht.html',
  './catering.html',
  './about.html',
  './contact.html',
  './impressum.html',
  './datenschutz.html',
  './style.css',
  './script.js',
  './tagesgericht.json',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V).then(cache => {
      // Lädt jede Datei einzeln; falls eine fehlt, bricht nicht alles ab
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => console.log('Nicht gecached:', url, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== V).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  const u = new URL(r.url);
  
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/admin') || /\.mp4$/.test(u.pathname) || r.headers.has('range')) {
    return;
  }

  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(V).then(cache => cache.put(r, clone));
        }
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
  );
});