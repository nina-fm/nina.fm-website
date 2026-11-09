import type { PlaybackStatus } from '~/features/playback/player.ts'

/**
 * Les toasts de la prod sur une écoute coupée (`app/stores/audio.ts`), déduits du
 * passage d'un statut du lecteur à un autre. Aucun tant que l'autoplay est refusé.
 */

export type NoticeKind = 'loading' | 'success' | 'error'

export interface Notice {
  /** Un toast d'un même identifiant remplace le précédent. */
  id: string
  kind: NoticeKind
  message: string
  /** En millisecondes ; `null` : jusqu'à ce qu'on le retire. */
  duration: number | null
  /** Le toast d'échec propose de relancer l'écoute. */
  retry?: boolean
}

export type NoticeChange = { show: Notice } | { dismiss: string } | null

export const RECONNECTING = 'reconnecting'

const waiting = (message: string): Notice => ({ id: RECONNECTING, kind: 'loading', message, duration: null })

const RESTORED: Notice = {
  id: RECONNECTING,
  kind: 'success',
  message: 'Connexion au flux audio restaurée',
  duration: 3_000,
}

const FAILED: Notice = {
  id: RECONNECTING,
  kind: 'error',
  message: 'Impossible de reconnecter au flux audio. Veuillez recharger la page.',
  duration: 10_000,
  retry: true,
}

/**
 * Le toast qui suit un changement de statut. `recovering` : le toast de reconnexion
 * est affiché, seule une écoute coupée se dit rétablie ou perdue.
 */
export function noticeFor(
  previous: PlaybackStatus,
  next: PlaybackStatus,
  context: { locked: boolean; recovering: boolean },
): NoticeChange {
  if (context.locked || previous === next) return null
  if (next === 'offline') return { show: waiting('Connexion perdue. En attente du réseau...') }
  if (next === 'reconnecting' || (next === 'loading' && previous === 'offline')) {
    return { show: waiting(previous === 'offline' ? 'Réseau rétabli. Reconnexion...' : 'Reconnexion en cours...') }
  }
  if (!context.recovering) return null
  if (next === 'playing') return { show: RESTORED }
  if (next === 'error' || next === 'interrupted') return { show: FAILED }
  if (next === 'stopped' || next === 'paused') return { dismiss: RECONNECTING }
  return null
}
