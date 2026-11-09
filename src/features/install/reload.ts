import type { PlaybackStatus } from '~/features/playback/player.ts'

/**
 * Recharger la page pour une nouvelle version ne coûte rien à l'auditeur : aucune
 * écoute en jeu, ni en pause, qui reste sur l'écran verrouillé (repris d'ohmyradios).
 * Une erreur, un flux hors ligne ou interrompu n'ont plus rien à garder.
 */
export function harmlessFor(status: PlaybackStatus): boolean {
  return status === 'stopped' || status === 'error' || status === 'offline' || status === 'interrupted'
}
