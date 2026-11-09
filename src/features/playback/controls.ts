import { type PlaybackStatus, isListening } from './player.ts'

/**
 * Ce que décide le branchement du lecteur sur l'élément <audio> (les modules
 * `.client.ts` du dossier), isolé de lui : combien de temps une écoute se
 * recherche, et à quoi mènent une panne, un refus ou la pause du système.
 * Repris d'ohmyradios, mesures comprises.
 */

/**
 * Durée pendant laquelle une écoute perdue se recherche avant d'abandonner. Une
 * seule borne, en temps : elle couvre un flux mort comme une courte perte de
 * réseau, et évite qu'un son surgisse des minutes après que l'auditeur est passé
 * à autre chose.
 */
export const RECONNECT_WINDOW_MS = 60_000

/** Délai avant une nouvelle tentative : doublé à chaque fois, pour ne pas marteler le serveur. */
export const retryDelay = (attempt: number): number => Math.min(1_000 * 2 ** attempt, 15_000)

/**
 * Silence après lequel un flux qui ne livre plus est tenu pour perdu. Une
 * connexion morte ne lève pas toujours d'erreur : passer du wifi aux données
 * mobiles, ou un serveur qui cesse d'envoyer, laisse seulement l'élément attendre.
 */
export const STALL_TIMEOUT_MS = 10_000

/**
 * Durée maximale d'une tentative de reconnexion. Sous les dix secondes pendant
 * lesquelles une page masquée reste éveillée après avoir cessé de jouer
 * (`audibleActivityClearDelay` de WebKit) : au-delà, un iPhone verrouillé la
 * suspend, et aucune tentative suivante ne tourne. Voir `hold()` (`source.client.ts`).
 */
export const ATTEMPT_TIMEOUT_MS = 8_000

/**
 * Durée maximale d'un premier chargement. Un serveur qui accepte la connexion
 * sans rien envoyer ne lève pas d'erreur : le navigateur peut attendre des
 * minutes avant d'abandonner.
 */
export const FIRST_LOAD_TIMEOUT_MS = 15_000

/**
 * Combien de temps une pause imposée par le système garde sa source, en
 * attendant que le système la reprenne (fin d'un appel). Un flux en pause continue
 * de se télécharger : passé ce délai, le silence le remplace, et seul l'auditeur
 * lève la pause.
 */
export const IMPOSED_PAUSE_HOLD_MS = 5 * 60_000

/**
 * Combien de temps la pause de l'auditeur garde le silence en lecture. Un iPhone
 * verrouillé suspend une page qui ne joue rien, et le bouton lecture de l'écran
 * verrouillé attend alors le déverrouillage. Passé ce délai, le silence s'arrête
 * et la page peut dormir : la batterie compte davantage.
 */
export const PAUSE_AWAKE_MS = 10 * 60_000

/** Où en est la reconnexion : aucune, en cours, ou hors délai pendant sa dernière tentative. */
export type Reconnection = 'none' | 'under way' | 'expired'

/**
 * Ce à quoi mène une panne du flux, `undefined` quand rien. Une écoute qui avait
 * démarré, ou que le réseau a coupée, se rétablit. Un flux injoignable dès son
 * premier chargement, appareil en ligne, se signale aussitôt : réessayer ne ferait
 * que retarder le message.
 */
export function afterFailure(at: {
  status: PlaybackStatus
  pauseImposed: boolean
  reconnection: Reconnection
  /** La demande en cours a joué au moins une fois. */
  established: boolean
  online: boolean
}): 'silence' | 'give up' | 'retry' | 'reconnect' | 'report' | undefined {
  // Un flux qui meurt sous une pause imposée, avant d'avoir rien livré, laisse
  // l'élément illisible : Chromium refuse alors le `play()` du système sans
  // événement `play`, et la fin de l'appel passerait inaperçue. Le silence prend
  // sa place, pour que le système le reprenne.
  if (at.status === 'paused' && at.pauseImposed) return 'silence'
  if (!isListening(at.status)) return undefined
  if (at.reconnection === 'expired') return 'give up'
  if (at.reconnection === 'under way') return 'retry'
  // `navigator.onLine` n'est cru que lorsqu'il vaut faux : c'est là qu'il est fiable.
  return at.established || !at.online ? 'reconnect' : 'report'
}

/**
 * Ce à quoi mène un `play()` refusé, `undefined` quand rien : remplacé par un
 * chargement plus récent ou par un arrêt, ce n'est pas une panne du flux.
 *
 * iOS n'autorise `play()` hors geste que sur un élément qui a déjà joué : sinon,
 * seul l'auditeur peut relancer. Un refus avant toute lecture n'est pas une
 * interruption : rien n'avait été entendu.
 */
export function afterRefusal(
  name: string,
  /** Une reconnexion était en cours, d'un flux qui avait joué. */
  interrupted: boolean,
): 'interrupted' | 'error' | 'failure' | undefined {
  if (name === 'AbortError') return undefined
  if (name !== 'NotAllowedError') return 'failure'
  return interrupted ? 'interrupted' : 'error'
}

/**
 * Ce que veut dire le bouton pause du système. Le bouton unique d'un casque
 * bascule, et le système choisit l'action d'après l'élément : sur iOS, le silence
 * qu'une pause joue lui fait renvoyer pause. Un appel envoie pause aussi, à la
 * sonnerie puis au décroché, mais après avoir coupé l'élément : celle-là est du
 * système, jamais un appui (mesuré sur iPhone par ohmyradios, 2026-10-24).
 */
export function systemPause(at: {
  ios: boolean
  elementPaused: boolean
  status: PlaybackStatus
}): 'imposed' | 'resume' | 'pause' {
  if (at.ios && at.elementPaused) return 'imposed'
  return at.status === 'paused' ? 'resume' : 'pause'
}
