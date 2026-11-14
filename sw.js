/* Service worker for Emi's games: caches all the games + icons so they
   run offline (e.g. on a plane) after the first visit with internet.
   Strategy: stale-while-revalidate — serve the cached copy instantly,
   refresh it in the background, fall back to network when uncached. */
var CACHE = 'kid-games-v5';
var CORE = [
  '/kid-games/',
  '/kid-games/memory/',
  '/kid-games/dressup/',
  '/kid-games/maze/',
  '/kid-games/maze/assets/fairy.png',
  '/kid-games/maze/assets/unicorn.png',
  '/kid-games/maze/assets/reward.jpg',
  '/kid-games/animals/',
  '/kid-games/animals/assets/img/dog.jpg',
  '/kid-games/animals/assets/img/cat.jpg',
  '/kid-games/animals/assets/img/cow.jpg',
  '/kid-games/animals/assets/img/pig.jpg',
  '/kid-games/animals/assets/img/sheep.jpg',
  '/kid-games/animals/assets/img/duck.jpg',
  '/kid-games/animals/assets/img/horse.jpg',
  '/kid-games/animals/assets/img/lion.jpg',
  '/kid-games/animals/assets/img/elephant.jpg',
  '/kid-games/animals/assets/img/frog.jpg',
  '/kid-games/animals/assets/img/chicken.jpg',
  '/kid-games/animals/assets/img/monkey.jpg',
  '/kid-games/animals/assets/snd/dog.mp3',
  '/kid-games/animals/assets/snd/cat.mp3',
  '/kid-games/animals/assets/snd/cow.mp3',
  '/kid-games/animals/assets/snd/pig.mp3',
  '/kid-games/animals/assets/snd/sheep.mp3',
  '/kid-games/animals/assets/snd/duck.mp3',
  '/kid-games/animals/assets/snd/horse.mp3',
  '/kid-games/animals/assets/snd/lion.mp3',
  '/kid-games/animals/assets/snd/elephant.mp3',
  '/kid-games/animals/assets/snd/frog.mp3',
  '/kid-games/animals/assets/snd/chicken.mp3',
  '/kid-games/animals/assets/snd/monkey.mp3',
  '/kid-games/royal-boxes/',
  '/kid-games/royal-boxes/assets/img/royal-01.jpg',
  '/kid-games/royal-boxes/assets/img/royal-02.jpg',
  '/kid-games/royal-boxes/assets/img/royal-03.jpg',
  '/kid-games/royal-boxes/assets/img/royal-04.jpg',
  '/kid-games/royal-boxes/assets/img/royal-05.jpg',
  '/kid-games/royal-boxes/assets/img/royal-06.jpg',
  '/kid-games/royal-boxes/assets/img/royal-07.jpg',
  '/kid-games/royal-boxes/assets/img/royal-08.jpg',
  '/kid-games/royal-boxes/assets/img/royal-09.jpg',
  '/kid-games/royal-boxes/assets/img/royal-10.jpg',
  '/kid-games/royal-boxes/assets/img/royal-11.jpg',
  '/kid-games/royal-boxes/assets/img/royal-12.jpg',
  '/kid-games/royal-boxes/assets/img/queen.jpg',
  '/kid-games/royal-boxes/assets/img/win.jpg',
  '/kid-games/icon-bubble.png',
  '/kid-games/icon-match.png',
  '/kid-games/icon-dressup.png',
  '/kid-games/icon-maze.png',
  '/kid-games/icon-animals.png',
  '/kid-games/icon-royal.png'
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
