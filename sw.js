const CACHE = 'ot-realestate-pwa-v2';

const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {

  const request = event.request;

  /*
    index.html은 항상 최신 파일을 먼저 확인한다.
    예전 런처 화면이 캐시에 남는 문제 방지.
  */
  if(
    request.mode === 'navigate' ||
    new URL(request.url).pathname.endsWith('/index.html')
  ){
    event.respondWith(
      fetch(request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put(request, copy));

          return response;

        })
        .catch(() => caches.match(request))
    );

    return;
  }

  /*
    나머지 파일은 캐시 우선
  */
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request))
  );

});
