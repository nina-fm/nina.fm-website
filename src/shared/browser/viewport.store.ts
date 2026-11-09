import { createSignal } from 'solid-js'

/** La taille de la fenêtre, comme `useWindowSize` (VueUse) dans la prod. */

const [width, setWidth] = createSignal(0)
const [height, setHeight] = createSignal(0)

export const viewport = { width, height }

/** Suit les redimensionnements et les rotations. Renvoie de quoi arrêter. */
export function followViewport(): () => void {
  const update = () => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  }
  update()
  window.addEventListener('resize', update)
  return () => window.removeEventListener('resize', update)
}
