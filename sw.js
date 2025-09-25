self.addEventListener('install', e => {
    e.waitUntil(caches.open('invsales-cache').then(cache => {
        return cache.addAll(['./', './index.html', './style.css', './app.js']);
    }));
});
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(resp => resp || fetch(e.request))
    );
});
