/* Run during activation of the municipal release, without touching other sites. */
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name =>
    name.startsWith('observatorio-') && !/v46(?:$|-)/.test(name) && !name.includes('precache')
  ).map(name => caches.delete(name)))));
});
