import { type Accessor, onCleanup } from 'solid-js'
import { landLaunch } from '~/features/install/launch.client.ts'
import { autoplay } from '~/features/playback/autoplay.store.ts'
import { player } from '~/features/playback/player.store.ts'
import { followDaylight } from '~/features/theme/daylight.store.ts'
import { loadPreferences } from '~/features/theme/preferences.store.ts'
import { followFullscreen } from '~/shared/browser/fullscreen.store.ts'
import { useMounted } from '~/shared/ui/mounted.store.ts'
import { followBody } from './body.store.ts'
import { followDebug } from './debug.store.ts'
import { listenToKeys } from './keyboard.client.ts'
import { type ListeningFlags, listeningFlags } from './listening.ts'
import { followNotices } from './notices.store.ts'
import { closeDetailsOffMixtape } from './panels.store.ts'
import { rotateTabTitle } from './tab-title.client.ts'

/**
 * L'îlot de la coquille, monté une fois et persistant (`BaseLayout.astro`) : il lit
 * les préférences et branche tout ce qui suit la page (classes du `<body>`, heure,
 * plein écran, toasts, titre, clavier, débogueur), et met fin à l'écran de lancement
 * de l'app installée. `mounted`: ce que ses composants
 * ne dessinent qu'une fois le navigateur lu.
 */
export function useShell(): { mounted: Accessor<boolean>; listening: Accessor<ListeningFlags> } {
  const mounted = useMounted(() => {
    loadPreferences()
    const stops = [followDaylight(), followFullscreen(), rotateTabTitle(), listenToKeys(), followBody()]
    followNotices()
    followDebug()
    closeDetailsOffMixtape()
    landLaunch()
    onCleanup(() => stops.forEach((stop) => stop()))
  })
  const listening = () =>
    mounted() ? listeningFlags(player.state.status, autoplay.state()) : listeningFlags('stopped', 'unknown')
  return { mounted, listening }
}
