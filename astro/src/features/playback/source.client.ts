import { player } from './player.store.ts'
import type { PlayingRadio } from './player.ts'
import { startKeepAwake, stopKeepAwake } from './keep-awake.client.ts'
import { isSilence, silenceUrl } from './silence.client.ts'
import { clearSystem, setSystemState, showOnSystem } from './system-controls.client.ts'

/**
 * L'unique élément <audio> et ce qu'il joue : le flux, le silence qui garde la
 * page éveillée, ou rien. Ce module est le seul du projet à poser sa source.
 */

let element: HTMLAudioElement | null = null

/** L'élément monté par l'îlot du lecteur, `null` avant et après. */
export const audio = (): HTMLAudioElement | null => element

export function setElement(mounted: HTMLAudioElement | null): void {
  element = mounted
}

/** L'élément joue le silence plutôt que le flux. */
export function isHolding(): boolean {
  return isSilence(element?.getAttribute('src') ?? null)
}

/** Pointe l'élément sur le flux et le joue : la promesse de `play()`. */
export function load(radio: PlayingRadio): Promise<void> | undefined {
  if (!element) return undefined

  // Réutiliser le même élément interrompt le flux précédent : c'est ce qui rend
  // « un seul flux à la fois » concret.
  element.loop = false
  element.src = radio.streamUrl
  showOnSystem(radio)
  // Montré en lecture dès la connexion : une écoute relancée depuis une pause ne
  // doit pas laisser l'écran verrouillé sur « en pause » jusqu'au démarrage du flux.
  setSystemState('playing')

  return element.play()
}

/**
 * Garde la page sonore jusqu'à la prochaine tentative, en jouant un silence en
 * boucle. Un iPhone verrouillé suspend une page restée muette dix secondes,
 * minuteurs compris : une reconnexion ne tournerait alors jamais, et l'écran
 * verrouillé perdrait la radio. Arrêté comme le flux, par `release()` ou le
 * prochain `load()` ; une pause ne fait que le mettre en pause.
 */
export function hold(): void {
  if (!element || isHolding()) return
  startKeepAwake()
  attachSilence()
  // Refusé seulement là où jouer hors geste l'est : la page peut alors être
  // suspendue, comme sans lui, et rien d'autre ne change.
  void element.play().then(
    () => {
      // iOS montre l'icône du site sur l'écran verrouillé une fois la source changée.
      const radio = player.state.radio
      if (radio) showOnSystem(radio)
    },
    () => undefined,
  )
}

/** Remplace le flux par le silence, sans le jouer. */
export function attachSilence(): void {
  if (!element || isHolding()) return
  element.loop = true
  element.src = silenceUrl()
}

/** Détache le flux de l'élément et vide les contrôles système. */
export function release(): void {
  stopKeepAwake()
  element?.pause()
  detachSource()
  clearSystem()
}

/**
 * Laisse l'élément sans source. Retirer le flux arrête son téléchargement :
 * laissé en place, il continuerait de remplir le tampon d'un direct que personne
 * n'écoute.
 */
function detachSource(): void {
  if (!element) return
  element.removeAttribute('src')
  element.load()
}
