import { RECONNECT_WINDOW_MS, type Reconnection, STALL_TIMEOUT_MS, retryDelay } from './controls.ts'
import { player } from './player.store.ts'
import type { PlayingRadio } from './player.ts'
import { audio, hold, isHolding } from './source.client.ts'

/**
 * Le rétablissement d'une écoute perdue : le chien de garde qui distingue un flux
 * muet d'un flux vivant, et la reconnexion qui réessaie dans sa fenêtre. Ce à quoi
 * mène une panne se décide dans `controls.ts`, par `failure.client.ts`.
 */

/** La demande en cours a joué au moins une fois. */
let established = false

export const isEstablished = (): boolean => established

/** Le flux joue : la demande est établie, et plus rien ne se recherche. */
export function establish(): void {
  established = true
  disarmWatchdog()
  endReconnection()
}

/** Oublie tout du rétablissement de la demande en cours. */
export function resetRecovery(): void {
  endReconnection()
  disarmWatchdog()
  established = false
}

let watchdogTimer: ReturnType<typeof setTimeout> | undefined
/** Position de lecture à l'armement du chien de garde, pour distinguer un flux vivant d'un muet. */
let watchedTime = 0

/**
 * Un flux qui reste muet compte comme une panne (`onSilent`) : une tentative qui
 * ne joue jamais, ou une écoute qui n'avance plus. Un flux qui avance est laissé
 * tranquille, et gardé sous surveillance tant que l'appareil est hors ligne.
 */
export function armWatchdog(onSilent: () => void, timeout = STALL_TIMEOUT_MS): void {
  const element = audio()
  if (watchdogTimer !== undefined || !element) return
  watchedTime = element.currentTime
  watchdogTimer = setTimeout(() => {
    watchdogTimer = undefined
    const current = audio()
    const progressing = current && !current.paused && current.currentTime > watchedTime
    if (!progressing) onSilent()
    else if (!navigator.onLine) armWatchdog(onSilent)
  }, timeout)
}

export function disarmWatchdog(): void {
  clearTimeout(watchdogTimer)
  watchdogTimer = undefined
}

/** Reconnexion en attente, `null` quand aucune. */
let reconnection: {
  attempts: number
  deadline: ReturnType<typeof setTimeout>
  /** La fenêtre s'est fermée pendant une tentative : celle-ci est la dernière. */
  expired: boolean
  /** Recharge le flux. */
  attempt(radio: PlayingRadio): void
  /** Abandonne l'écoute, hors délai. */
  giveUp(): void
} | null = null
let retryTimer: ReturnType<typeof setTimeout> | undefined

/** Le flux établi attend des données : son silence est surveillé (`onSilent`). */
export function watchStall(onSilent: () => void): void {
  if (!established) return
  // Le silence se compte à partir de maintenant. Une surveillance lancée plus tôt,
  // quand le réseau a été signalé perdu, compterait les dernières secondes du
  // tampon comme une progression et attendrait un tour de plus. Une surveillance
  // lancée à cette même position compte déjà ce silence : un `waiting` répété la garde.
  const element = audio()
  if (!reconnection && element && element.currentTime !== watchedTime) disarmWatchdog()
  armWatchdog(onSilent)
}

export function reconnectionState(): Reconnection {
  if (!reconnection) return 'none'
  return reconnection.expired ? 'expired' : 'under way'
}

export function beginReconnection(on: { attempt(radio: PlayingRadio): void; giveUp(): void }): void {
  reconnection = {
    attempts: 0,
    deadline: setTimeout(expire, RECONNECT_WINDOW_MS),
    expired: false,
    ...on,
  }
  player.reportReconnecting()
  scheduleRetry()
}

function expire(): void {
  if (!reconnection) return
  // Une tentative en cours finit : coupée quelques secondes avant de jouer, comme
  // quand le réseau revient juste avant la fin de la fenêtre, elle signalerait une
  // panne qui n'en est pas une. Son propre délai la borne.
  if (isHolding()) reconnection.giveUp()
  else reconnection.expired = true
}

export function scheduleRetry(): void {
  // Une seule tentative en attente : l'erreur de l'élément et le `play()` rejeté
  // signalent la même panne.
  if (!reconnection || retryTimer !== undefined) return
  hold()
  retryTimer = setTimeout(() => {
    retryTimer = undefined
    retry()
  }, retryDelay(reconnection.attempts))
}

/** Le réseau est revenu : la tentative suivante part aussitôt. */
export function retryNow(): void {
  if (!reconnection) return
  clearTimeout(retryTimer)
  retryTimer = undefined
  retry()
}

function retry(): void {
  const radio = player.state.radio
  // Hors ligne, une tentative échouerait : l'événement `online` lance la suivante.
  if (!reconnection || !radio || !navigator.onLine) return
  reconnection.attempts += 1
  reconnection.attempt(radio)
}

function endReconnection(): void {
  if (!reconnection) return
  clearTimeout(reconnection.deadline)
  clearTimeout(retryTimer)
  retryTimer = undefined
  reconnection = null
}
