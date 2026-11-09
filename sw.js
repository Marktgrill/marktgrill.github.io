// Marktgrill Service Worker: Netzwerk zuerst (immer aktuell), Cache als Offline-Reserve
const V = 'marktgrill-v1';
const ASSETS = ['./', 'index.html', 'speisekarte.html', 'tagesgericht.html', 'catering.html', 'about.html',
  'contact.html', 'impressum.html', 'datenschutz.html', 'style.css', 'script.js', 'tagesgericht.json',
  'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  // Nicht eingreifen: fremde Seiten, Admin-Bereich, Videos, Formulare
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/admin') || /\.mp4$/.test(u.pathname) || r.headers.has('range')) return;
  const key = u.origin + u.pathname;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(key, cp)); }
      return res;
    }).catch(() => caches.match(key).then(m => m || caches.match('index.html')))
  );
});
