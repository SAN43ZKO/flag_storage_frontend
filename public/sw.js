const CACHE = 'storage-v8';

const PRECACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Не обрабатываем не-GET запросы
  if (event.request.method !== 'GET') {
    return;
  }

  const url = event.request.url;

  // API-запросы: сначала сеть, затем кэш
  if (url.includes('/api/') || url.includes('/products')) {
    event.respondWith(networkFirst(event.request));
  } else {
    // Статика: сначала кэш, потом сеть
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          return caches.open(CACHE).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    // Кэшируем только успешные ответы
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    // При ошибке сети отдаём из кэша, если есть
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
