import { autoplay } from '~/features/playback/autoplay.store.ts'
import { play, stop } from '~/features/playback/controls.client.ts'
import { NINA } from '~/features/playback/stream.ts'

/**
 * Ce que la coquille demande au lecteur, toujours depuis le gestionnaire du geste :
 * sur iOS, `play()` n'est permis que dans sa tâche (`CLAUDE.md`).
 */

/** Lance l'écoute ; le geste lève aussi le refus d'autoplay. */
export function listen(): void {
  autoplay.unlock()
  play(NINA)
}

/** Recharge le flux depuis le direct (« Relancer » de la prod). */
export function relaunch(): void {
  stop()
  listen()
}
