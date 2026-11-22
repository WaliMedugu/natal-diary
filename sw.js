// Offline cache: the app works without data after the first visit.
const CACHE = "natal-diary-v1";
const FILES = ["./", "index.html", "src/styles.css", "src/app.js", "src/triage.js", "src/kb.js", "manifest.webmanifest"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))));
self.addEventListener("fetch", (e) => e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))));
