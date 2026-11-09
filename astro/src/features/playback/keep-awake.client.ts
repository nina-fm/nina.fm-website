import { PAUSE_AWAKE_MS } from './controls.ts'

/**
 * Garde la page sonore pendant qu'une écoute perdue se rétablit, par un silence de
 * Web Audio : un iPhone verrouillé suspend une page restée muette une quinzaine de
 * secondes, minuteurs et `online` compris. Le silence de l'élément (`hold()`) ne
 * suffit pas hors ligne : il a mis 13,7 s à démarrer, et la page s'est endormie
 * (website#92). Celui-ci ne charge rien, et part dès que le réseau tombe.
 *
 * iOS ne laisse démarrer un `AudioContext` que dans la tâche d'un geste : il est
 * créé au premier geste d'écoute (`unlockKeepAwake`), puis suspendu jusqu'au besoin.
 */

let context: AudioContext | null = null
/** Le contexte a tourné une fois dans un geste : il peut reprendre sans. */
let unlocked = false
let source: AudioBufferSourceNode | null = null
let limit: ReturnType<typeof setTimeout> | undefined

/** Dans la tâche d'un geste : prépare le contexte, laissé suspendu. */
export function unlockKeepAwake(): void {
  if (unlocked || typeof AudioContext === 'undefined') return
  if (navigator.userActivation && !navigator.userActivation.isActive) return
  context ??= new AudioContext()
  const ready = context
  void ready.resume().then(() => {
    unlocked = true
    if (!source) void ready.suspend()
  })
}

/** Le silence joue. Borné à `PAUSE_AWAKE_MS` : la batterie compte aussi. */
export function startKeepAwake(): void {
  if (!context || !unlocked || source) return
  source = context.createBufferSource()
  source.buffer = context.createBuffer(1, context.sampleRate, context.sampleRate)
  source.loop = true
  source.connect(context.destination)
  source.start()
  void context.resume()
  limit = setTimeout(stopKeepAwake, PAUSE_AWAKE_MS)
}

/** Le silence s'arrête, la page peut dormir. */
export function stopKeepAwake(): void {
  clearTimeout(limit)
  limit = undefined
  if (!source || !context) return
  source.stop()
  source.disconnect()
  source = null
  void context.suspend()
}

/** Pour le journal de website#92. */
export const keepAwakeState = (): string => (source ? (context?.state ?? '-') : 'off')
