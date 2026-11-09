import { player } from './player.store.ts'
import type { PlayingRadio } from './player.ts'
import { RECLAIM_AFTER_MS, type SystemTrack, sameTrack, systemMetadata } from './system-controls.ts'

/**
 * Les contrôles système (écran verrouillé, casque, notification) : ce qu'ils
 * montrent de l'écoute, et qui répond à leurs boutons. Absents des navigateurs
 * sans session média.
 */

const supported = (): boolean => 'mediaSession' in navigator

/** La dernière diffusion connue : gardée à travers les réécritures (silence, reprise). */
let given: SystemTrack | null = null

/** Montre l'écoute, avec ce que l'antenne diffuse quand on le sait. */
export function showOnSystem(radio: PlayingRadio): void {
  if (!supported()) return
  navigator.mediaSession.metadata = new MediaMetadata(systemMetadata(radio, location.origin, given))
}

/**
 * Ce que l'antenne diffuse (`null` : rien de connu). Les contrôles système le
 * montrent pendant une écoute, et ne sont réécrits que s'il change : chaque
 * réécriture peut faire clignoter la pochette. Gardé hors écoute, pour la suivante.
 */
export function showTrackOnSystem(track: SystemTrack | null): void {
  const changed = !sameTrack(given, track)
  given = track
  const radio = player.state.radio
  if (!changed || !radio || !supported() || !navigator.mediaSession.metadata) return
  showOnSystem(radio)
}

export function setSystemState(state: MediaSessionPlaybackState): void {
  if (supported()) navigator.mediaSession.playbackState = state
}

/** Les contrôles système ne montrent plus rien. La diffusion connue reste, pour la prochaine écoute. */
export function clearSystem(): void {
  if (!supported()) return
  navigator.mediaSession.playbackState = 'none'
  navigator.mediaSession.metadata = null
}

type Answers = { play(): void; pause(): void; stop(): void }

/** Les réponses du lecteur à lecture, pause et arrêt, gardées pour les redonner. */
let answers: Answers | undefined

/**
 * Confie les boutons lecture, pause et arrêt du système au lecteur. Ils agissent
 * vraiment sur l'écoute : le site Nuxt ne faisait que couper le son (`toggleMute`),
 * le flux continuait de se télécharger et l'écran verrouillé mentait sur l'état.
 */
export function answerSystem(on: Answers): void {
  answers = on
  if (!supported()) return
  navigator.mediaSession.setActionHandler('play', on.play)
  navigator.mediaSession.setActionHandler('pause', on.pause)
  navigator.mediaSession.setActionHandler('stop', on.stop)
  refuseSeeking()
}

/**
 * Un direct n'a pas de position à déplacer : le système n'offre pas de
 * déplacement (sinon iOS affiche −10 s et +10 s). Une action que le navigateur ne
 * connaît pas est sautée.
 */
function refuseSeeking(): void {
  for (const action of ['seekbackward', 'seekforward', 'seekto'] as const) {
    try {
      navigator.mediaSession.setActionHandler(action, null)
    } catch {
      // Inconnue de ce navigateur : rien à refuser.
    }
  }
}

/** Redonne tous les boutons, tels quels. */
export function reclaimSystem(): void {
  if (supported() && answers) answerSystem(answers)
}

let reclaiming: ReturnType<typeof setTimeout> | undefined

/**
 * À chaque début de son : les boutons tout de suite, puis une fois encore un
 * instant plus tard (`RECLAIM_AFTER_MS`), avec ce qui s'affiche. L'écran verrouillé
 * de l'iPhone ignore les boutons déclarés avant que son son joue, et la pochette
 * aussi : posée au lancement, elle n'apparaissait qu'après une reprise (website#92).
 */
export function reclaimSystemOnceHeard(): void {
  reclaimSystem()
  clearTimeout(reclaiming)
  reclaiming = setTimeout(() => {
    reclaimSystem()
    const radio = player.state.radio
    if (radio && supported() && navigator.mediaSession.metadata) showOnSystem(radio)
  }, RECLAIM_AFTER_MS)
}
