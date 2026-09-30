/* Service worker for Emi's games: caches both games + icons so they
   run offline (e.g. on a plane) after the first visit with internet.
   Strategy: stale-while-revalidate — serve the cached copy instantly,
   refresh it in the background, fall back to network when uncached. */
var CACHE = 'kid-games-v2';
var CORE = [
  '/kid-games/',
  '/kid-games/memory/',
  '/kid-games/dressup/',
  '/kid-games/icon-bubble.png',
  '/kid-games/icon-match.png',
  '/kid-games/icon-dressup.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // only our own files
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
