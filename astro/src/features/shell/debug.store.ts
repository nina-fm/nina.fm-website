import { createEffect, createSignal, on } from 'solid-js'
import { autoplay } from '~/features/playback/autoplay.store.ts'
import { player } from '~/features/playback/player.store.ts'
import { cookieValue, readCookie } from '~/features/theme/preferences.ts'

/**
 * Le débogueur audio de la prod, visible seulement avec le cookie `codemaster-debug`
 * posé à la main ; `codemaster-debug-open` garde son panneau ouvert. Il journalise
 * chaque statut du lecteur et la réponse à l'autoplay.
 */

export interface DebugLog {
  timestamp: number
  message: string
}

const OPEN_COOKIE = 'codemaster-debug-open'

const [enabled, setEnabled] = createSignal(false)
const [open, setOpen] = createSignal(false)
const [logs, setLogs] = createSignal<readonly DebugLog[]>([])

export const debug = { enabled, open, logs }

export function log(message: string): void {
  if (!enabled()) return
  setLogs([...logs(), { timestamp: Date.now(), message }])
  console.log(message)
}

export function clearLogs(): void {
  log('clearLogs')
  setLogs([])
}

export function setDebugOpen(value: boolean): void {
  document.cookie = `${OPEN_COOKIE}=${cookieValue(value)}; path=/`
  setOpen(value)
}

/** Lit les cookies, puis journalise l'écoute si le débogueur est actif. */
export function followDebug(): void {
  setEnabled(!!readCookie(document.cookie, 'codemaster-debug'))
  setOpen(readCookie(document.cookie, OPEN_COOKIE) === true)
  if (!enabled()) return
  createEffect(
    on(
      () => player.state.status,
      (status) => log(`statut : ${status}`),
    ),
  )
  createEffect(on(autoplay.state, (state) => log(`autoplay : ${state}`)))
}

/** Fait défiler le journal jusqu'au dernier message, à chaque nouveau (`AudioDebugger.vue`). */
export function useDebugScroll(): (bottom: HTMLElement) => void {
  let end: HTMLElement | undefined
  createEffect(on(logs, () => end?.scrollIntoView({ behavior: 'smooth' }), { defer: true }))
  return (bottom) => (end = bottom)
}
