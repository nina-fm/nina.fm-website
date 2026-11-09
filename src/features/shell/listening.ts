import type { Autoplay } from '~/features/playback/autoplay.store.ts'
import type { PlaybackStatus } from '~/features/playback/player.ts'

/**
 * Ce que la coquille montre de l'écoute, traduit des statuts du lecteur
 * (`playback/player.ts`) dans les termes de la prod (`app/stores/audio.ts`).
 */

export interface ListeningFlags {
  loading: boolean
  /** L'autoplay est refusé et l'auditeur n'a pas encore lancé l'écoute. */
  locked: boolean
  playing: boolean
}

export function listeningFlags(status: PlaybackStatus, autoplay: Autoplay): ListeningFlags {
  return {
    loading: status === 'loading' || status === 'reconnecting',
    locked: autoplay === 'blocked',
    playing: status === 'playing',
  }
}

/**
 * Le calque posé sur la scène tant qu'elle ne joue pas : rien, un voile seul, le
 * chargement, ou le gros bouton lecture quand l'autoplay est refusé.
 */
export type OverlayView = 'hidden' | 'veil' | 'loader' | 'play'

export function overlayView(flags: ListeningFlags): OverlayView {
  if (flags.playing) return 'hidden'
  if (flags.locked) return 'play'
  return flags.loading ? 'loader' : 'veil'
}

/**
 * Le bouton de relance, sous le voile d'une écoute qui s'est arrêtée sans que
 * l'auditeur l'ait voulu, réseau présent. Hors ligne, le lecteur attend le réseau.
 */
export function showsRelaunch(status: PlaybackStatus): boolean {
  return status === 'paused' || status === 'error' || status === 'interrupted'
}
