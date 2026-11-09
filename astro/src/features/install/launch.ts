/**
 * L'écran de lancement de l'app installée (`Launch.astro`), décidé avant le premier
 * affichage (repris d'ohmyradios) : un script bloquant du `<head>` pose `data-launch`
 * sur `<html>`, et l'écran couvre la page jusqu'à ce que la coquille soit montée
 * (`launch.client.ts`). Une fois par onglet : le routeur rejoue les scripts en ligne
 * à chaque navigation, et l'app rouverte depuis l'arrière-plan reprend sa page sans
 * nouveau document. Le rechargement qui apporte une nouvelle version oublie la marque
 * (`reload.client.ts`) : il rouvre sur l'écran de lancement.
 *
 * L'app vérifie aussi s'il existe une nouvelle version en s'ouvrant
 * (`register.client.ts`) : `data-update="pending"` fait attendre l'écran dès ici,
 * avant que ce module, chargé plus tard, n'ait pu le dire.
 */

/** La marque de l'onglet, dans `sessionStorage`. */
export const LAUNCHED = 'ninafm-launched'

/** Sans coquille montée au bout de ce délai, l'écran laisse voir la page telle qu'elle est. */
export const GIVE_UP_MS = 10000

export interface LaunchPage {
  root: HTMLElement
  /** Ouverte depuis l'écran d'accueil, pas dans un onglet. */
  installed: boolean
  session: Pick<Storage, 'getItem' | 'setItem'>
  online: boolean
  /** Un service worker sert déjà la page : il peut y avoir une version plus récente. */
  controlled: boolean
  later: (then: () => void, milliseconds: number) => void
}

/** Recopiée dans la page : ne lit que ses paramètres. */
export function launch(page: LaunchPage, mark: string, giveUp: number): void {
  if (!page.installed || page.session.getItem(mark)) return
  page.session.setItem(mark, '1')
  const root = page.root
  root.dataset.launch = ''
  if (page.online && page.controlled) root.dataset.update = 'pending'
  page.later(() => {
    // Pris en main par la coquille (`mounted`) : elle le retirera elle-même.
    if (root.dataset.launch === '') delete root.dataset.launch
    if (root.dataset.update === 'pending') delete root.dataset.update
  }, giveUp)
}

/** Le script de la page. Une erreur (stockage refusé) laisse la page sans écran, jamais sans page. */
export function launchScript(): string {
  const page = `{
  root: document.documentElement,
  installed: matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
  session: sessionStorage,
  online: navigator.onLine,
  controlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
  later: function (then, milliseconds) { setTimeout(then, milliseconds) }
}`
  const call = `(${String(launch)})(${page}, ${JSON.stringify(LAUNCHED)}, ${GIVE_UP_MS});`
  return `(function () {\ntry {\n${call}\n} catch (_error) {}\n})()`
}
