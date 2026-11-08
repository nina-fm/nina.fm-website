import { type Accessor, createEffect, createSignal, onCleanup } from 'solid-js'
import { basicColors } from '~/features/theme/rainbowColors.ts'
import { preferences } from '~/features/theme/preferences.store.ts'

/**
 * Le calque psychédélique de la prod (`Rainbow.vue`) : une couleur par période, en
 * fondu de la même durée, fusionnée avec la scène selon le thème.
 */
export interface RainbowView {
  active: Accessor<boolean>
  color: Accessor<string | undefined>
  duration: Accessor<number>
  blend: Accessor<string>
}

export function useRainbow(): RainbowView {
  const options = () => preferences.theme().options.rainbow
  const colors = () => options()?.colors ?? basicColors
  const duration = () => options()?.duration ?? 10_000
  const active = () => preferences.rainbow() && !!options()
  const [index, setIndex] = createSignal(0)

  createEffect(() => {
    if (!active()) return setIndex(0)
    const count = colors().length
    // Setter fonctionnel : lire `index()` ici abonnerait l'effet au signal qu'il écrit.
    const advance = () => setIndex((current) => (current + 1) % count)
    // La première couleur part tout de suite, comme dans la prod.
    advance()
    const interval = setInterval(advance, duration())
    onCleanup(() => clearInterval(interval))
  })

  return {
    active,
    color: () => colors()[index()],
    duration,
    blend: () => options()?.class ?? '',
  }
}
