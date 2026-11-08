import { type Accessor, createSignal, onMount } from 'solid-js'

/**
 * Le composant est-il monté : ce que le rendu statique ne peut pas savoir (lecteur,
 * cookies, heure) ne se lit qu'alors, pour que l'hydratation retrouve le HTML du
 * build. Repris d'ohmyradios ; `load` s'exécute juste avant.
 */
export function useMounted(load?: () => void): Accessor<boolean> {
  const [mounted, setMounted] = createSignal(false)
  onMount(() => {
    load?.()
    setMounted(true)
  })
  return mounted
}
