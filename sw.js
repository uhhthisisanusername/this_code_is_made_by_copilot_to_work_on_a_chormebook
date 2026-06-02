const CACHE = "chromebook-notes-v1";
const ASSETS = [
  ".",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", evt => {
  evt.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", evt => {
  evt.waitUntil(clients.claim());
});

self.addEventListener("fetch", evt => {
  evt.respondWith(
    caches.match(evt.request).then(cached => cached || fetch(evt.request).catch(()=> caches.match("index.html")))
  );
});
