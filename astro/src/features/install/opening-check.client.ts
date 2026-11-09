import { harmless, reload } from './reload.client.ts'
import { announce, stepOf } from './update-step.client.ts'

/**
 * La vérification d'une nouvelle version à l'ouverture de l'app installée, sous
 * l'écran de lancement (repris d'ohmyradios, décision `pwa-update-at-opening`).
 */

/** Ne se montre qu'au-delà : pas de voile à chaque ouverture quand le réseau répond vite. */
const SHOW_DELAY_MS = 300

/**
 * Au-delà, une vérification qui n'a encore rien trouvé laisse la place à l'app. Une
 * version trouvée plus tard arrive par le rechargement en arrière-plan.
 */
const CHECK_TIMEOUT_MS = 4000

/**
 * Au-delà, une nouvelle version encore en cours d'installation laisse la place à l'app.
 * L'installation télécharge tout le précache, un fichier à la fois (Workbox le fait
 * exprès), ce qui dépasse largement 4 s sur un téléphone : l'écran l'attend, pour que
 * l'app soit à jour une fois qu'il part. Seule une installation bloquée atteint ce délai.
 */
const INSTALL_TIMEOUT_MS = 30000

/** Ce que l'enregistrement sait des versions (`register.client.ts`), partagé avec une vérification. */
export interface Versions {
  /** Une nouvelle version a pris la main sur cette page. */
  updated: boolean
  /** Une vérification à l'ouverture retient l'app sous l'écran de lancement. */
  checking: boolean
}

/**
 * Une ouverture retenue sous l'écran de lancement, jusqu'à `done` : son étape ne se
 * montre qu'après un délai, et elle cède après une échéance. Propre à cette ouverture :
 * une suivante repart de zéro, et rien qui reste de celle-ci (un minuteur, l'état d'un
 * worker) ne peut y mettre fin.
 */
function holdOpening(versions: Versions) {
  let open = true
  /** La nouvelle version qui s'installe, une fois trouvée. */
  let worker: ServiceWorker | null = null
  let shown = false
  const show = setTimeout(() => {
    // Une écoute lancée avant que la vérification ne se montre : ni voile, ni rechargement.
    if (!harmless()) return done()
    shown = true
    announce(worker ? 'installing' : 'checking')
  }, SHOW_DELAY_MS)
  let deadline = setTimeout(done, CHECK_TIMEOUT_MS)

  function done() {
    if (!open) return
    open = false
    versions.checking = false
    clearTimeout(show)
    clearTimeout(deadline)
    worker?.removeEventListener('statechange', settle)
    announce(null)
  }

  /** Met fin à l'ouverture une fois que la nouvelle version a pris la main, ou échoué. */
  function settle() {
    if (!open || !worker) return
    // Elle a pris la main : le rechargement passe par elle, `controllerchange` venu ou non.
    if (worker.state === 'activated') {
      versions.updated = true
      return harmless() ? reload() : done()
    }
    // Échec de l'installation : la version affichée reste, et fonctionne.
    if (worker.state === 'redundant') done()
  }

  return {
    done,
    isOpen: () => open,
    /** Retient l'écran jusqu'à ce que la nouvelle version qui s'installe prenne la main. */
    wait(installing: ServiceWorker) {
      worker = installing
      if (shown) announce('installing')
      clearTimeout(deadline)
      deadline = setTimeout(done, INSTALL_TIMEOUT_MS)
      worker.addEventListener('statechange', settle)
      settle()
    },
  }
}

/** Vérifie s'il existe une nouvelle version à l'ouverture, l'app retenue sous l'écran de lancement. */
export async function checkAtOpening(registration: ServiceWorkerRegistration, versions: Versions): Promise<void> {
  if (versions.updated) {
    // Une nouvelle version a pris la main pendant que la page ne pouvait pas recharger.
    announce('installing')
    return reload()
  }
  versions.checking = true
  // Retenue, pas encore montrée : le lancement l'attend quand même.
  if (!stepOf()) announce('pending')
  const opening = holdOpening(versions)
  try {
    // Au lancement, le navigateur installe peut-être déjà une version trouvée de
    // lui-même : un `update()` demandé maintenant n'aurait sa réponse qu'après.
    if (!registration.installing) await registration.update()
    // Déjà fini : l'écran a cédé pendant une vérification lente.
    if (!opening.isOpen()) return
    const worker = registration.installing ?? registration.waiting
    // Plus rien qui s'installe : soit rien de nouveau, soit une version qui a pris la
    // main pendant la vérification, dont l'écran couvre le rechargement.
    if (!worker) return versions.updated ? reload() : opening.done()
    opening.wait(worker)
  } catch {
    opening.done()
  }
}
