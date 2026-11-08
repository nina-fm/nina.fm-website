import { createEffect } from 'solid-js'
import { autoplay } from '~/features/playback/autoplay.store.ts'
import { mute } from '~/features/playback/mute.store.ts'
import { player } from '~/features/playback/player.store.ts'
import { bodyClasses } from '~/features/theme/preferences.ts'
import { preferences } from '~/features/theme/preferences.store.ts'
import { listeningFlags } from './listening.ts'
import { panels } from './panels.store.ts'

/**
 * Tient `data-theme` et les classes du `<body>` à jour, après le script de démarrage
 * (`theme/boot.ts`) : elles pilotent les variantes Tailwind des thèmes. `ClientRouter`
 * remplace le `<body>` à chaque navigation : elles y sont reposées.
 */
export function followBody(): () => void {
  const apply = () => {
    const theme = preferences.theme().key
    document.body.dataset.theme = theme
    document.body.className = bodyClasses({
      theme,
      dark: preferences.dark(),
      rainbow: preferences.rainbow(),
      muted: mute.muted(),
      ...listeningFlags(player.state.status, autoplay.state()),
      details: panels.details(),
      content: panels.content(),
    })
  }
  createEffect(apply)
  document.addEventListener('astro:after-swap', apply)
  return () => document.removeEventListener('astro:after-swap', apply)
}
