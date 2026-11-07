/**
 * L'état du lecteur, sa forme et ce qu'il permet (le store qui le porte :
 * `player.store.ts`), à l'écart de tout accès au DOM. Repris d'ohmyradios.
 *
 * Le branchement sur l'élément <audio> vit dans `controls.client.ts`. Cette
 * séparation rend l'état testable sans navigateur, et fait d'« un seul flux à la
 * fois » un invariant de l'état plutôt qu'une convention laissée aux appelants.
 */

/** Le flux tel que le lecteur en a besoin. Nina.fm n'en a qu'un : `NINA` (`stream.ts`). */
export interface PlayingRadio {
  /** Identifiant stable. */
  readonly id: string
  readonly name: string
  readonly streamUrl: string
  /** Image montrée par les contrôles système quand aucune pochette n'est connue. */
  readonly imageUrl: string
}

/**
 * Le chargement se distingue de la lecture établie : un flux met parfois
 * plusieurs secondes à démarrer, et un auditeur sans retour croit son appareil
 * en panne.
 */
export type PlaybackStatus =
  'stopped' | 'loading' | 'playing' | 'paused' | 'reconnecting' | 'error' | 'offline' | 'interrupted'

/**
 * Une écoute est en cours : ce que l'auditeur a demandé est en jeu, et se montre
 * comme tel. Tous les autres statuts sont silencieux.
 */
export function isListening(status: PlaybackStatus): boolean {
  return status === 'loading' || status === 'playing' || status === 'reconnecting'
}

/**
 * Forme interne de l'état. Mutable : le store de Solid écrit par chemin de
 * propriété et refuse les champs en lecture seule.
 */
export interface MutableState {
  /** `null` tant qu'aucune écoute n'a été demandée. */
  radio: PlayingRadio | null
  status: PlaybackStatus
  /**
   * Le flux a joué depuis la demande. Gardé à travers une pause ou une panne :
   * une reconnexion est alors le retour d'une écoute, pas une première attente
   * du réseau.
   */
  played: boolean
}

/** Ce que voient les appelants : le même état, en lecture seule. */
export type PlayerState = Readonly<MutableState>

export interface Player {
  readonly state: PlayerState
  /** Demande la lecture. Interrompt l'écoute en cours, s'il y en a une. */
  request(radio: PlayingRadio): void
  /** Le flux joue vraiment. */
  confirmPlaying(): void
  /** Le flux met en mémoire tampon après avoir démarré. */
  reportLoading(): void
  /** Le flux est injoignable ou illisible. */
  reportError(): void
  /**
   * L'appareil n'a pas de connexion. Distinct de `error` : le flux n'est pas en
   * cause, et l'auditeur peut y faire quelque chose.
   */
  reportOffline(): void
  /**
   * Une écoute demandée a été coupée et se rétablit. Distinct de `loading` :
   * l'auditeur doit voir que le site s'en occupe.
   */
  reportReconnecting(): void
  /**
   * Le navigateur refuse de reprendre sans geste de l'auditeur (iOS) : lui seul
   * peut relancer la radio.
   */
  reportInterrupted(): void
  /**
   * Pause demandée par les contrôles système. Contrairement à un arrêt, l'écoute
   * est gardée : l'écran verrouillé continue de la montrer, et son bouton lecture
   * la reprend.
   */
  pause(): void
  /** Arrêt demandé, par l'auditeur ou par les contrôles système. */
  stop(): void
}

export const INITIAL_STATE: PlayerState = { radio: null, status: 'stopped', played: false }
