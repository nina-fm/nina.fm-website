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
 *
 * Sur iPhone, la première ouverture après l'installation charge parfois la page sans
 * ses scripts ni ses premières images (website#87) ; la suivante va bien. Tant que la
 * coquille n'est pas montée, rien ne joue : un script de `_astro/` qui échoue, ou une
 * coquille absente au bout du délai, recharge la page sous l'écran. Une seule fois par
 * session : ensuite l'écran laisse voir la page telle qu'elle est.
 */

export const MARKS = {
  /** La marque de l'onglet, dans `sessionStorage`. */
  launched: 'ninafm-launched',
  /** Le lancement a déjà été rechargé une fois. */
  retried: 'ninafm-launch-retried',
}

/** Sans coquille montée au bout de ce délai, l'écran recharge, puis laisse voir la page. */
export const GIVE_UP_MS = 10000

export interface LaunchPage {
  root: HTMLElement
  /** Ouverte depuis l'écran d'accueil, pas dans un onglet. */
  installed: boolean
  session: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  online: boolean
  /** Un service worker sert déjà la page : il peut y avoir une version plus récente. */
  controlled: boolean
  later: (then: () => void, milliseconds: number) => void
  /** Appelle `then` quand un script du site ne charge pas. */
  failed: (then: () => void) => void
  reload: () => void
}

/** Recopiée dans la page : ne lit que ses paramètres. */
export function launch(page: LaunchPage, marks: typeof MARKS, giveUp: number): void {
  if (!page.installed || page.session.getItem(marks.launched)) return
  page.session.setItem(marks.launched, '1')
  const root = page.root
  root.dataset.launch = ''
  if (page.online && page.controlled) root.dataset.update = 'pending'
  // Seulement avant que la coquille ne prenne la main (`mounted`) : rien ne joue encore.
  const retry = () => {
    if (root.dataset.launch !== '' || page.session.getItem(marks.retried)) return false
    page.session.setItem(marks.retried, '1')
    page.session.removeItem(marks.launched)
    page.reload()
    return true
  }
  page.failed(retry)
  page.later(() => {
    if (retry()) return
    // Pris en main par la coquille : elle le retirera elle-même.
    if (root.dataset.launch === '') delete root.dataset.launch
    if (root.dataset.update === 'pending') delete root.dataset.update
  }, giveUp)
}

/**
 * Un script de `_astro/` qui ne charge pas : l'élément le dit par `error`, qui ne
 * remonte pas (d'où la capture) ; l'import d'un îlot, par une promesse rejetée.
 */
const FAILED = `function (then) {
  addEventListener('error', function (event) {
    var target = event.target
    if (target && target.tagName === 'SCRIPT' && /\\/_astro\\//.test(target.src)) then()
  }, true)
  addEventListener('unhandledrejection', function (event) {
    if (/module/i.test(String(event.reason && event.reason.message))) then()
  })
}`

/** Le script de la page. Une erreur (stockage refusé) laisse la page sans écran, jamais sans page. */
export function launchScript(): string {
  const page = `{
  root: document.documentElement,
  installed: matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
  session: sessionStorage,
  online: navigator.onLine,
  controlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
  later: function (then, milliseconds) { setTimeout(then, milliseconds) },
  failed: ${FAILED},
  reload: function () { location.reload() }
}`
  const call = `(${String(launch)})(${page}, ${JSON.stringify(MARKS)}, ${GIVE_UP_MS});`
  return `(function () {\ntry {\n${call}\n} catch (_error) {}\n})()`
}
