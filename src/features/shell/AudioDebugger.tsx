import { For, Show } from 'solid-js'
import { stop } from '~/features/playback/controls.client.ts'
import { buttonClass } from '~/shared/ui/button.ts'
import ControlButton from './ControlButton.tsx'
import { relaunch } from './actions.client.ts'
import { clearLogs, debug, setDebugOpen, useDebugScroll } from './debug.store.ts'
import Icon from '~/shared/ui/Icon.tsx'

/**
 * Le débogueur audio (`AudioDebugger.vue`) : un bouton, et un panneau non modal qui
 * laisse la page utilisable et ne se ferme que par sa croix.
 */
export default function AudioDebugger() {
  const bottom = useDebugScroll()
  return (
    <Show when={debug.enabled()}>
      <ControlButton
        variant="outline"
        label="Débogueur audio"
        class="absolute top-20 right-5 z-50 md:right-7"
        onClick={() => setDebugOpen(!debug.open())}
      >
        <Icon name="bug" />
      </ControlButton>
      <Show when={debug.open()}>
        <section
          role="dialog"
          aria-labelledby="audio-debugger-title"
          class="animate-in bg-background/90 fade-in-0 zoom-in-95 fixed top-1/2 left-10 z-50 grid max-h-[90dvh] w-full max-w-lg -translate-y-1/2 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 border p-0 shadow-lg backdrop-blur duration-200 sm:w-96 sm:rounded-lg"
        >
          <header class="flex flex-col gap-y-1.5 p-6 pb-0 text-center sm:text-left">
            <h2 id="audio-debugger-title" class="text-lg leading-none font-semibold tracking-tight">
              Audio Debugger
            </h2>
          </header>
          <div class="grid gap-4 overflow-y-auto px-6 pb-4">
            <div class="flex flex-col items-start justify-start gap-0">
              <For each={debug.logs()}>
                {(log) => <pre class="text-sm whitespace-nowrap before:mr-2 before:content-['▶︎']">{log.message}</pre>}
              </For>
              <div ref={bottom} class="h-0" />
            </div>
          </div>
          <footer class="flex flex-col-reverse p-6 pt-0 sm:flex-row sm:justify-end sm:gap-x-2">
            <button type="button" class={buttonClass('outline', 'sm')} onClick={() => stop()}>
              Fermer le flux
            </button>
            <button type="button" class={buttonClass('outline', 'sm')} onClick={relaunch}>
              Relancer le flux
            </button>
            <button type="button" class={buttonClass('default', 'sm')} onClick={clearLogs}>
              Effacer les logs
            </button>
          </footer>
          <button
            type="button"
            aria-label="Fermer"
            class="focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
            onClick={() => setDebugOpen(false)}
          >
            <Icon name="x" class="h-4 w-4" />
          </button>
        </section>
      </Show>
    </Show>
  )
}
