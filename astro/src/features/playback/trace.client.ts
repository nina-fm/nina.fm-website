import { keepAwakeState } from './keep-awake.client.ts'
import { player } from './player.store.ts'
import { isHolding } from './source.client.ts'

/**
 * TEMPORAIRE (website#92), retiré avant le merge. Journal de ce que vit le lecteur
 * écran verrouillé : une page suspendue ne parle pas à l'inspecteur web, le journal
 * se relit donc après le déverrouillage, dans la console : `copy(ninaTrace())`.
 * `ninaTrace.clear()` le vide. Un battement toutes les 2 s : un trou dans les
 * battements est une suspension de la page.
 */

const KEY = 'ninafm-trace'
const MAX = 5000
const BEAT_MS = 2000

const ELEMENT_EVENTS = [
  'loadstart',
  'play',
  'playing',
  'pause',
  'waiting',
  'stalled',
  'suspend',
  'canplay',
  'error',
  'ended',
  'emptied',
  'abort',
]

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

/** L'état de l'élément et du lecteur en une ligne. */
function snapshot(element: HTMLAudioElement): string {
  const source = !element.getAttribute('src') ? 'none' : isHolding() ? 'silence' : 'stream'
  return [
    `status=${player.state.status}`,
    `src=${source}`,
    `paused=${element.paused}`,
    `t=${element.currentTime.toFixed(1)}`,
    `ready=${element.readyState}`,
    `net=${element.networkState}`,
    `err=${element.error?.code ?? '-'}`,
    `online=${navigator.onLine}`,
    `vis=${document.visibilityState}`,
    `wa=${keepAwakeState()}`,
    `ms=${'mediaSession' in navigator ? navigator.mediaSession.playbackState : '-'}`,
  ].join(' ')
}

function writer(element: HTMLAudioElement): (event: string) => void {
  return (event) => {
    const time = new Date().toISOString().slice(11, 23)
    const lines = read()
    lines.push(`${time} ${event.padEnd(16)} ${snapshot(element)}`)
    try {
      localStorage.setItem(KEY, JSON.stringify(lines.slice(-MAX)))
    } catch {
      // Stockage plein ou refusé : le journal s'arrête là.
    }
  }
}

/** Les boutons du système, journalisés avant d'être confiés au lecteur. */
function traceSystemButtons(log: (event: string) => void): void {
  if (!('mediaSession' in navigator)) return
  const session = navigator.mediaSession
  const original = session.setActionHandler.bind(session)
  session.setActionHandler = (action, handler) =>
    original(
      action,
      handler &&
        ((details) => {
          log(`system:${action}`)
          handler(details)
        }),
    )
}

/** Branche le journal sur l'élément, la page et les boutons du système. */
export function startTrace(element: HTMLAudioElement): void {
  // Les tests du lecteur tournent sans page : pas de journal.
  if (typeof document === 'undefined') return
  const log = writer(element)
  const global = window as unknown as { ninaTrace?: (() => string) & { clear(): void } }
  global.ninaTrace = Object.assign(() => read().join('\n'), { clear: () => localStorage.removeItem(KEY) })
  for (const type of ELEMENT_EVENTS) element.addEventListener(type, () => log(type))
  for (const type of ['online', 'offline', 'pagehide', 'pageshow', 'focus', 'blur']) {
    window.addEventListener(type, () => log(type))
  }
  document.addEventListener('visibilitychange', () => log('visibility'))
  document.addEventListener('freeze', () => log('freeze'))
  document.addEventListener('resume', () => log('resume'))
  traceSystemButtons(log)
  setInterval(() => log('beat'), BEAT_MS)
  log('start')
}
