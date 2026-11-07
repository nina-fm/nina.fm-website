import { ATTEMPT_TIMEOUT_MS, afterFailure, afterRefusal } from './controls.ts'
import { clearPause, isPauseImposed } from './pause.client.ts'
import { player } from './player.store.ts'
import type { PlayingRadio } from './player.ts'
import {
  armWatchdog,
  beginReconnection,
  disarmWatchdog,
  isEstablished,
  reconnectionState,
  resetRecovery,
  scheduleRetry,
} from './recovery.client.ts'
import { attachSilence, load, release } from './source.client.ts'

/**
 * Ce à quoi mène une panne du flux, comme `controls.ts` le décide : le silence
 * sous une pause imposée, une nouvelle tentative, une reconnexion, ou l'écoute
 * abandonnée avec sa raison.
 */

/** Charge le flux, sa panne surveillée : un `play()` refusé, ou un flux encore muet après `timeout`. */
export function loadWatched(radio: PlayingRadio, timeout: number): void {
  load(radio)?.catch(onRejected)
  armWatchdog(failure, timeout)
}

/**
 * Le flux est en panne (`afterFailure`). Un flux injoignable dès son premier
 * chargement est libéré comme toute écoute abandonnée, et l'écran verrouillé
 * cesse de le montrer.
 */
export function failure(): void {
  const next = afterFailure({
    status: player.state.status,
    pauseImposed: isPauseImposed(),
    reconnection: reconnectionState(),
    established: isEstablished(),
    online: navigator.onLine,
  })
  if (!next) return
  if (next === 'silence') return attachSilence()
  disarmWatchdog()
  if (next === 'give up') giveUp()
  else if (next === 'retry') scheduleRetry()
  else if (next === 'reconnect') reconnect()
  else abandon(() => player.reportError())
}

/** Recherche l'écoute perdue, dans la fenêtre de reconnexion. */
export function reconnect(): void {
  beginReconnection({ attempt: (radio) => loadWatched(radio, ATTEMPT_TIMEOUT_MS), giveUp })
}

function onRejected(error: unknown): void {
  const name = error instanceof DOMException ? error.name : ''
  const next = afterRefusal(name, reconnectionState() !== 'none' && player.state.played)
  if (next === 'failure') failure()
  else if (next === 'interrupted') abandon(() => player.reportInterrupted())
  else if (next === 'error') abandon(() => player.reportError())
}

function giveUp(): void {
  abandon(() => (navigator.onLine ? player.reportError() : player.reportOffline()))
}

/** Renonce à rétablir l'écoute, et dit pourquoi. */
function abandon(report: () => void): void {
  forget()
  report()
  // Une tentative tardive ne doit pas se mettre à jouer après que l'auditeur a
  // appris l'échec.
  release()
}

/** Oublie tout de la demande en cours : son rétablissement, sa pause. */
export function forget(): void {
  resetRecovery()
  clearPause()
}
