/**
 * Enregistre le service worker. La nouvelle version prend la main dès qu'elle est
 * installée (`skipWaiting`, `clientsClaim`) et sert la page au chargement suivant.
 * Le rechargement à l'ouverture de l'app installée, qui doit épargner l'écoute en
 * cours, viendra avec le lecteur (website#77).
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}
