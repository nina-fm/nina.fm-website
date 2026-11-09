import { FIRST_LOAD_TIMEOUT_MS, systemPause } from './controls.ts'
import { failure, forget, loadWatched, reconnect } from './failure.client.ts'
import { startKeepAwake, stopKeepAwake, unlockKeepAwake } from './keep-awake.client.ts'
import { isPauseImposed, keepsAwake, pause, suspendsSilentPages } from './pause.client.ts'
import { player } from './player.store.ts'
import { type PlayingRadio, isListening } from './player.ts'
import { armWatchdog, establish, reconnectionState, retryNow, watchStall } from './recovery.client.ts'
import { audio, isHolding, release, setElement } from './source.client.ts'
import { answerSystem, reclaimSystemOnceHeard, showOnSystem } from './system-controls.client.ts'
import { startTrace } from './trace.client.ts'

/**
 * Branchement de l'état du lecteur sur l'unique élément <audio> : ses événements,
 * et les commandes qui lisent, mettent en pause et arrêtent. La source se pose dans
 * `source.client.ts`, une pause dans `pause.client.ts`, une écoute perdue se
 * rétablit dans `recovery.client.ts`, une panne se traite dans `failure.client.ts`,
 * et ce que chacun décide est dans `controls.ts`. Repris d'ohmyradios.
 *
 * Pourquoi pas un effet réactif : sur iOS, `play()` n'est permis que dans la même
 * tâche que le geste de l'auditeur. Un effet Solid tournerait après le retour du
 * gestionnaire de clic, et le navigateur refuserait la lecture. `play()` s'appelle
 * donc directement depuis le gestionnaire.
 */

let listeners: AbortController | null = null

/** Appelé une fois par l'îlot du lecteur, quand l'élément est monté. */
export function attachElement(element: HTMLAudioElement): void {
  startTrace(element)
  setElement(element)
  listeners = new AbortController()
  const { signal } = listeners
  const on = (type: string, handler: () => void, target: EventTarget = element) =>
    target.addEventListener(type, handler, { signal })
  // Le silence joué par `hold()` ne dit rien du flux.
  const ofStream = (handler: () => void) => () => {
    if (!isHolding()) handler()
  }

  // Le système reprend l'élément de lui-même (Chrome sur Android à la fin d'un
  // appel). Il jouerait le tampon périmé, ou le silence d'une reconnexion : une
  // pause qu'il a imposée se lève en rechargeant le direct. Sur `play`, pas sur
  // `playing` : un flux mis en pause avant d'avoir rien livré ne jouerait jamais.
  on('play', () => {
    if (player.state.status === 'paused' && isPauseImposed()) resume()
  })
  // Sous la pause de l'auditeur, seul joue le silence qui garde la page éveillée :
  // pas le système qui reprendrait l'élément.
  on('playing', () => {
    // À chaque départ, silence compris : l'écran verrouillé ne prend que les
    // boutons déclarés une fois le son lancé.
    reclaimSystemOnceHeard()
    if (player.state.status === 'paused') {
      if (!(isHolding() && keepsAwake())) element.pause()
    } else if (!isHolding()) onPlaying()
  })
  on('waiting', ofStream(onWaiting))
  // Non filtré : une pause du silence vient aussi du système, un appel pendant une
  // reconnexion.
  on('pause', onImposedPause)
  on('error', ofStream(failure))
  // Un direct ne finit jamais : s'il finit, le serveur l'a lâché.
  on('ended', ofStream(failure))
  on('offline', onOffline, window)
  on('online', onOnline, window)

  answerSystem({ play: resume, pause: onSystemPause, stop: () => stop() })
}

/** Pour les tests et au démontage : oublie l'élément courant. */
export function detachElement(): void {
  listeners?.abort()
  listeners = null
  forget()
  setElement(null)
}

/**
 * Lance l'écoute. Appelé depuis un gestionnaire d'événement de l'auditeur, ou au
 * chargement seulement quand l'autoplay est permis (`shared/browser/detectAutoplay.client.ts`) ; la
 * fin d'une pause imposée par le système fait exception, voir `resume()`.
 */
export function play(radio: PlayingRadio): void {
  unlockKeepAwake()
  // L'écoute déjà en cours : la relancer couperait le son une seconde ou deux, ou
  // ferait tomber une reconnexion. Ni le bouton du site ni celui d'un casque ne
  // sont faits pour ça.
  if (player.state.radio?.id === radio.id && isListening(player.state.status)) return

  forget()
  player.request(radio)

  // Hors ligne, le flux ne peut pas charger : on attend le réseau sans le toucher.
  // Le flux précédent est libéré quand même : laissé attaché, son tampon
  // continuerait de jouer, et ses événements seraient comptés pour la nouvelle demande.
  if (!navigator.onLine) {
    release()
    showOnSystem(radio)
    reconnect()
    return
  }

  loadWatched(radio, FIRST_LOAD_TIMEOUT_MS)
}

/** Lève une pause, dans le direct : la lecture de l'écran verrouillé, ou la fin d'un appel. */
function resume(): void {
  const radio = player.state.radio
  if (radio) play(radio)
}

export function stop(): void {
  forget()
  player.stop()
  release()
}

function onSystemPause(): void {
  const status = player.state.status
  const action = systemPause({
    ios: suspendsSilentPages(),
    elementPaused: !!audio()?.paused,
    status,
  })
  if (action === 'imposed') onImposedPause()
  else if (action === 'resume') resume()
  else pause()
}

function onPlaying(): void {
  stopKeepAwake()
  establish()
  player.confirmPlaying()
}

function onWaiting(): void {
  player.reportLoading()
  watchStall(failure)
}

/**
 * Une pause que personne ici n'a demandée : le système a pris l'audio (casque
 * débranché, appel, Siri). Traitée comme une pause de l'écran verrouillé : aucune
 * panne ultérieure ne peut ramener le son toute seule, et l'écran verrouillé peut
 * reprendre.
 */
function onImposedPause(): void {
  // Nos arrêts ne laissent pas de source (`release`), nos pauses un statut
  // silencieux ; un événement périmé trouve l'élément qui rejoue ; un flux qui
  // finit ou casse est une panne, traitée comme telle. Toute écoute est concernée,
  // une connexion ou une reconnexion comprise : un appel doit les faire taire aussi.
  const element = audio()
  if (!element || !element.paused || element.ended || element.error) return
  if (!element.getAttribute('src') || !isListening(player.state.status)) return
  pause({ imposed: true })
}

function onOffline(): void {
  // Le flux n'est pas coupé : le navigateur peut signaler un changement de réseau
  // auquel le flux survit, et le tampon continue de jouer. Mettre en pause
  // l'écourterait, et sur un iPhone verrouillé laisserait le système suspendre la
  // page. Le chien de garde dit s'il est vraiment mort, une connexion perdue ne
  // levant pas toujours d'erreur.
  if (!isListening(player.state.status)) return
  // Le tampon joue encore : la page reste sonore quand il se tait (`keep-awake.client.ts`).
  startKeepAwake()
  if (reconnectionState() === 'none') armWatchdog(failure)
}

/**
 * Le réseau revient : la tentative suivante part aussitôt, et une écoute abandonnée
 * faute de réseau reprend, comme le promet son message (« En attente du réseau »).
 * Hors geste : iOS le permet à l'élément qui a déjà joué.
 */
function onOnline(): void {
  if (player.state.status === 'offline') resume()
  else retryNow()
}
