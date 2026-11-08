import { createSignal } from 'solid-js'

/** Le plein écran de la page, comme dans la prod (pas de préfixe : l'iPhone ne l'a pas). */

const [fullscreen, setFullscreen] = createSignal(false)
const [available, setAvailable] = createSignal(false)

/** `available` : l'iPhone n'a pas l'API, la prod y montrait un bouton sans effet. */
export const screenMode = { fullscreen, available }

export function toggleFullscreen(): void {
  const done = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
  done.catch((error: unknown) => console.warn('Plein écran refusé :', error))
}

/** Suit le plein écran, quitté aussi par Échap ou le système. Renvoie de quoi arrêter. */
export function followFullscreen(): () => void {
  const update = () => setFullscreen(!!document.fullscreenElement)
  setAvailable(document.fullscreenEnabled === true)
  update()
  document.addEventListener('fullscreenchange', update)
  return () => document.removeEventListener('fullscreenchange', update)
}
