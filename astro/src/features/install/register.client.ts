import { installedApp } from '~/shared/browser/installed-app.client.ts'
import { type Versions, checkAtOpening } from './opening-check.client.ts'
import { harmless, reload } from './reload.client.ts'
import { announce } from './update-step.client.ts'

/**
 * Enregistre le service worker, et apporte une nouvelle version à l'app installée au
 * plus tard à son ouverture suivante (repris d'ohmyradios, website#87).
 *
 * La nouvelle version prend la main dès qu'elle est installée (`skipWaiting`,
 * `clientsClaim`), mais ne remplace pas la page affichée. Sur iPhone, fermer l'app la
 * met seulement en arrière-plan : la rouvrir reprend la même page, sans navigation,
 * donc sans vérification ni nouveau document. D'où deux temps :
 *
 * - chaque retour au premier plan vérifie s'il existe une nouvelle version ;
 * - une fois qu'elle a pris la main, la page se recharge la prochaine fois qu'elle est
 *   cachée, hors de la vue de l'auditeur, pour que l'ouverture suivante la montre.
 *
 * Le rechargement attend qu'il ne coûte rien (`reload.ts`) : jamais pendant une écoute.
 *
 * Dans l'app installée, l'ouverture elle-même attend la vérification, sous l'écran de
 * lancement, pour qu'une nouvelle version se montre tout de suite. Seulement quand
 * recharger ne coûte rien, et en ligne. Une fois une version trouvée, l'écran reste
 * jusqu'à ce qu'elle ait pris la main. L'étape est dite sur `<html>` (`data-update`) ;
 * le script du `<head>` dit déjà `pending` dès le premier affichage (`launch.ts`).
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  const container = navigator.serviceWorker

  // Aucune version active encore : c'est la première installation, dont la prise de
  // main ne change rien à l'écran. Seule celle-là est ignorée ; chaque suivante est une
  // nouvelle version. Demandé à l'enregistrement, pas à `container.controller` : un
  // rechargement forcé laisse la page sans contrôleur alors qu'une version est active.
  let installing = false
  const versions: Versions = { updated: false, checking: false }

  const reloadIfHarmless = () => {
    if (versions.updated && document.visibilityState === 'hidden' && harmless()) reload()
  }

  container.addEventListener('controllerchange', () => {
    if (installing) {
      installing = false
      return
    }
    versions.updated = true
    if (versions.checking && harmless()) reload()
    else reloadIfHarmless()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate(container, versions).catch(() => {})
    else reloadIfHarmless()
  })

  // Enregistré une fois cela su, pour que l'installation ne puisse pas venir avant.
  void container
    .getRegistration()
    .then((registration) => {
      installing = !registration?.active
    })
    .catch(() => {})
    .then(() => container.register('/sw.js'))
    // Un lancement est aussi une ouverture, sauf le rechargement qui apporte une
    // nouvelle version : il vient d'être vérifié.
    .then(() => (reloaded() ? undefined : checkForUpdate(container, versions)))
    .catch(() => {})
    // Aucune vérification ne retient l'ouverture : le lancement n'a plus à attendre.
    .then(() => {
      if (!versions.checking && document.documentElement.dataset.update === 'pending') announce(null)
    })
}

/** Chaque ouverture cherche une nouvelle version ; l'app installée l'attend. */
async function checkForUpdate(container: ServiceWorkerContainer, versions: Versions) {
  const registration = await container.getRegistration()
  if (!registration?.active || versions.checking) return
  if (installedApp() && navigator.onLine && harmless()) await checkAtOpening(registration, versions)
  // Hors ligne, la vérification échoue : le prochain retour au premier plan réessaie.
  else await registration.update()
}

function reloaded(): boolean {
  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  return navigation?.type === 'reload'
}
