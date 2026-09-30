/* Remove only legacy version-suffixed runtime caches.
 * Stable runtime caches and Workbox precache entries are preserved.
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => /^observatorio-(?:static|fonts|documents|api)-v\d+$/.test(key))
          .map(key => caches.delete(key)),
      ),
    ),
  );
});
