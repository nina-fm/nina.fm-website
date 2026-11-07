import { createSignal, onCleanup, onMount } from 'solid-js'

/**
 * L'appareil a-t-il une connexion, pour un composant : supposé en ligne jusqu'au
 * montage, le rendu statique ne pouvant pas le savoir.
 */
export function useOnline(): () => boolean {
  const [online, setOnline] = createSignal(true)
  onMount(() => {
    const update = () => setOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    onCleanup(() => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    })
  })
  return online
}
