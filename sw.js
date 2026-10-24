/* Service worker MiamBox : fonctionnement hors connexion.
   IMPORTANT : changez VERSION à chaque modification des fichiers. */
const VERSION = "miambox-v6";
const FICHIERS = ["./", "./index.html", "./style.css", "./app.js", "./manifest.json", "./logo.png", "./logo-split.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
