const APP_CACHE = 'rusyn-app-v1';
const MODEL_CACHE = 'rusyn-onnx-v1'; // musi sa zhodovat s Preklad.vue

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE).then(cache => cache.addAll(APP_SHELL))
  );
  // novy SW preberie kontrolu ihned bez cakania na zatvorenie tabu
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== APP_CACHE && k !== MODEL_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  // prevezme vsetkych klientov bez reload
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ONNX modely a tokenizer - cache first, stiahne app sama pri prvom spusteni
  if (url.pathname.endsWith('.onnx') || url.pathname.endsWith('tokenizer.json')) {
    event.respondWith(
      caches.open(MODEL_CACHE).then(cache =>
        cache.match(event.request).then(cached => cached || fetch(event.request))
      )
    );
    return;
  }

  // SPA navigacia - network first, fallback na index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // JS, CSS, ikony, fonty - cache first, pri cache miss ulozi do APP_CACHE
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(APP_CACHE).then(cache => cache.put(event.request, clone));
        }
        return res;
      });
    })
  );
});