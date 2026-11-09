import { Show } from 'solid-js'
import Toaster from '~/shared/ui/Toaster.tsx'
import AudioDebugger from './AudioDebugger.tsx'
import AutoplayOverlay from './AutoplayOverlay.tsx'
import Rainbow from './Rainbow.tsx'
import { overlayView, showsRelaunch } from './listening.ts'
import { useShell } from './shell.store.ts'
import { player } from '~/features/playback/player.store.ts'

/**
 * Ce que la coquille pose au-dessus de toute scène (`app.vue`) : calque d'autoplay,
 * débogueur, toasts, arc-en-ciel. Le calque est dans le HTML du build, voile seul :
 * la prod le rendait aussi côté serveur.
 */
export default function Shell() {
  const shell = useShell()
  return (
    <>
      <AutoplayOverlay
        view={overlayView(shell.listening())}
        relaunch={shell.mounted() && showsRelaunch(player.state.status)}
      />
      <Show when={shell.mounted()}>
        <AudioDebugger />
        <Toaster />
        <Rainbow />
      </Show>
    </>
  )
}
