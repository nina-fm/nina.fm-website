import { isIos } from '~/shared/device.ts'
import { IMPOSED_PAUSE_HOLD_MS, PAUSE_AWAKE_MS } from './controls.ts'
import { stopKeepAwake } from './keep-awake.client.ts'
import { player } from './player.store.ts'
import { isListening } from './player.ts'
import { resetRecovery } from './recovery.client.ts'
import { attachSilence, audio, isHolding } from './source.client.ts'
import { setSystemState } from './system-controls.client.ts'

/** iOS, où un appareil verrouillé suspend une page devenue muette. */
export function suspendsSilentPages(): boolean {
  return isIos(navigator.userAgent, navigator.maxTouchPoints)
}

/** La pause en cours a été imposée par le système, pas demandée par l'auditeur. */
let pauseImposed = false
/** Met fin à l'attente que le système lève la pause qu'il a imposée. */
let imposedPauseTimer: ReturnType<typeof setTimeout> | undefined
/** Met fin au silence que joue la pause de l'auditeur, `undefined` une fois arrêté. */
let awakeTimer: ReturnType<typeof setTimeout> | undefined

export const isPauseImposed = (): boolean => pauseImposed

/** La pause de l'auditeur joue le silence qui garde la page éveillée. */
export const keepsAwake = (): boolean => awakeTimer !== undefined

/**
 * Met en pause depuis les contrôles système. L'écoute et ses métadonnées restent :
 * l'écran verrouillé continue de la montrer et son bouton lecture la reprend, là
 * où un arrêt ne laisserait rien à reprendre. Une source reste attachée aussi, qui
 * garde vivante la session média d'iOS, mais c'est le silence : un direct en pause
 * continuerait de se télécharger. La reprise recharge le flux, pour rejoindre le
 * direct plutôt que rejouer un tampon périmé.
 *
 * Le silence est lancé : Chrome sur Android ne garde dans sa session média qu'un
 * élément qui a joué, et l'écouteur `playing` le remet aussitôt en pause. Sur iOS
 * il joue `PAUSE_AWAKE_MS` : un iPhone verrouillé suspend une page muette, et ne
 * lui transmettrait le bouton lecture qu'une fois déverrouillé.
 *
 * Une pause imposée par le système garde sa source un moment : à la fin d'un appel,
 * Chrome reprend l'élément qu'il a mis en pause, et rien d'autre ne dit à la page
 * que l'appel est fini. Passé ce délai, le silence est seulement attaché : lancé
 * sans geste, il prendrait le focus audio à ce que l'auditeur écoute entre-temps.
 *
 * Sur iOS, l'élément que le système a mis en pause est laissé tel quel : remis en
 * pause par la page, il n'est plus repris à la fin de l'appel. Laissé seul, rien ne
 * joue pendant l'appel, et le système envoie lecture à la fin (mesuré sur iPhone
 * par ohmyradios, 2026-10-24). Écran verrouillé, iOS suspend la page pendant
 * l'appel et retire le lecteur de l'écran verrouillé : il ne revient, et la lecture
 * avec lui, qu'au déverrouillage, en une ou deux secondes. Aucun silence ne l'évite,
 * l'appel prenant l'audio (mesuré sur iPhone, website#92).
 */
export function pause({ imposed = false } = {}): void {
  // Une écoute abandonnée n'a rien à mettre en pause : son message reste affiché.
  if (!isListening(player.state.status)) return
  pauseImposed = imposed
  stopKeepAwake()
  resetRecovery()
  clearPause()
  player.pause()
  // Sur iOS, l'élément continue pour le silence de la pause de l'auditeur, et le
  // système l'a déjà mis en pause pour une pause qu'il impose.
  const ios = suspendsSilentPages()
  if (!ios) audio()?.pause()
  if (imposed) {
    imposedPauseTimer = setTimeout(settlePause, IMPOSED_PAUSE_HOLD_MS)
  } else {
    settlePause()
    if (ios) awakeTimer = setTimeout(sleep, PAUSE_AWAKE_MS)
    audio()
      ?.play()
      .catch(() => undefined)
  }
  setSystemState('paused')
}

/**
 * Laisse l'élément en pause sur le silence. Dès lors, la pause est à l'auditeur de
 * lever : le système qui reprendrait l'élément ne jouerait que le silence.
 */
function settlePause(): void {
  imposedPauseTimer = undefined
  pauseImposed = false
  attachSilence()
}

/** Met fin au silence de la pause de l'auditeur : la page peut dormir. */
function sleep(): void {
  awakeTimer = undefined
  if (isHolding()) audio()?.pause()
}

/** Oublie les minuteurs de la pause en cours. */
export function clearPause(): void {
  clearTimeout(imposedPauseTimer)
  imposedPauseTimer = undefined
  clearTimeout(awakeTimer)
  awakeTimer = undefined
}
