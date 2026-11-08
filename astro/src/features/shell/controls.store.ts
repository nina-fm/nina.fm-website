import { type Accessor } from 'solid-js'
import { mute } from '~/features/playback/mute.store.ts'
import { player } from '~/features/playback/player.store.ts'
import { type DarkMode } from '~/features/theme/preferences.ts'
import { preferences } from '~/features/theme/preferences.store.ts'
import type { Theme } from '~/features/theme/themes.ts'
import { screenMode } from '~/shared/browser/fullscreen.store.ts'
import { useMounted } from '~/shared/ui/mounted.store.ts'

/** Ce que montrent les contrôles de la scène, lus une fois montés comme dans la prod (`ClientOnly`). */
export interface ControlsView {
  mounted: Accessor<boolean>
  /** Le thème a un bouton jour/nuit. */
  hasNight: Accessor<boolean>
  darkMode: Accessor<DarkMode>
  hasRainbow: Accessor<boolean>
  rainbow: Accessor<boolean>
  next: Accessor<Theme | undefined>
  playing: Accessor<boolean>
  muted: Accessor<boolean>
  fullscreen: Accessor<boolean>
  /** Le navigateur permet le plein écran. */
  hasFullscreen: Accessor<boolean>
}

export function useControls(): ControlsView {
  const mounted = useMounted()
  return {
    mounted,
    hasNight: () => !!preferences.theme().options.darkMode,
    darkMode: preferences.darkMode,
    hasRainbow: () => !!preferences.theme().options.rainbow,
    rainbow: preferences.rainbow,
    next: preferences.next,
    playing: () => player.state.status === 'playing',
    muted: mute.muted,
    fullscreen: screenMode.fullscreen,
    hasFullscreen: screenMode.available,
  }
}
