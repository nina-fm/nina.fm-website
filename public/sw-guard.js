// Chargé en premier par le service worker (voir src/features/install/service-worker.build.ts),
// pour que son écouteur passe avant celui de Workbox.
//
// Le flux audio ne doit jamais passer par le service worker : un flux est sans fin et se
// négocie par plages d'octets, le mettre en cache ou le rejouer remplirait l'appareil et
// casserait la lecture. Le flux (flux.nina.fm) comme l'API (api.nina.fm) vivent sur une
// autre origine : toute requête d'une autre origine est laissée au navigateur, sans
// respondWith, et aucun écouteur suivant ne la voit.
self.addEventListener('fetch', (event) => {
  if (new URL(event.request.url).origin !== self.location.origin) {
    event.stopImmediatePropagation()
  }
})
