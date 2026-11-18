// Ја чува апликацијата на уредот за да работи и без интернет.
// Кога се објавува нова верзија, смени го бројот подолу за корисниците да ја добијат.
var CACHE = 'dumpling-vault-v28';
var FILES = ['./', './index.html', './manifest.json', './icon.svg', './zvuci/omg.m4a', './slike/face1.webp', './slike/face2.webp'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Прво од мрежа (за да стигнат новите верзии и укинатите кодови), па од зачуваното ако нема интернет.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.cache === 'no-store') return;   // проверката за нова верзија оди директно на мрежа и не се чува
  // cache: 'no-cache' = секогаш прашај го серверот дали има нова верзија, наместо да се земе старата од кешот на прелистувачот
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(function (r) {
    var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return r;
  }).catch(function () { return caches.match(e.request); }));
});
