import { createSignal } from 'solid-js'
import { audio } from './source.client.ts'

/**
 * Le son coupé, comme dans la prod : l'élément reste en lecture, muet. Gardé à travers
 * une reconnexion, puisque c'est le même élément ; jamais une raison d'appeler `play()`.
 */

const [muted, setMuted] = createSignal(false)

export const mute = { muted }

/** Coupe ou rend le son de l'écoute en cours (bouton, barre d'espace). */
export function toggleMute(): void {
  const element = audio()
  if (element) element.muted = !element.muted
}

/** Suit l'élément, y compris quand d'autres que le site le rendent muet. Renvoie de quoi arrêter. */
export function followMute(element: HTMLAudioElement): () => void {
  const update = () => setMuted(element.muted)
  update()
  element.addEventListener('volumechange', update)
  return () => element.removeEventListener('volumechange', update)
}
