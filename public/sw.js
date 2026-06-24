const CACHE = 'storage-v2';

// При установке сразу кэшируем главные страницы (без хэшей)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
        // CSS и JS не перечисляем – они будут кэшированы при первом же запросе
      ]);
    })
  );
});

// Стратегия «сначала кэш, потом сеть» для всех ресурсов
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      // Если в кэше есть – отдаём из кэша, иначе грузим из сети
      return cached || fetch(e.request).then(response => {
        // Кэшируем ответ для будущих посещений
        return caches.open(CACHE).then(cache => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});

// При активации удаляем старые версии кэша
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      );
    })
  );
});
