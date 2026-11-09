import { For, Match, Show, Switch } from 'solid-js'
import { toaster } from './toast.store.ts'
import Icon from '~/shared/ui/Icon.tsx'

/**
 * Les toasts, en bas au centre, au rendu de vue-sonner dans la prod (`Notifier.vue`) :
 * 356 px, 16 px de marge, coins de 8 px, texte de 13 px, icône dans 24 px.
 */
export default function Toaster() {
  return (
    <ol
      aria-live="polite"
      class="fixed right-4 bottom-4 left-4 z-[999999999] flex flex-col items-center gap-[14px] sm:right-auto sm:bottom-8 sm:left-1/2 sm:w-[356px] sm:-translate-x-1/2"
    >
      <For each={toaster.toasts()}>
        {(toast) => (
          <li
            class="animate-in border-border bg-background text-foreground fade-in-0 slide-in-from-bottom-4 flex w-full items-center gap-1.5 rounded-lg border p-4 text-[13px] shadow-lg"
            data-testid="toast"
            data-kind={toast.kind}
          >
            <span class="mr-1 -ml-[3px] flex w-6 shrink-0 justify-start [&_svg]:size-4">
              <Switch>
                <Match when={toast.kind === 'loading'}>
                  <Icon name="loader-circle" class="animate-spin" />
                </Match>
                <Match when={toast.kind === 'success'}>
                  <Icon name="circle-check" />
                </Match>
                <Match when={toast.kind === 'error'}>
                  <Icon name="circle-alert" />
                </Match>
              </Switch>
            </span>
            <span class="leading-normal font-medium">{toast.message}</span>
            <Show when={toast.action}>
              {(action) => (
                <button
                  type="button"
                  class="bg-primary text-primary-foreground ml-auto h-6 shrink-0 rounded px-2 text-xs font-medium"
                  onClick={() => action().run()}
                >
                  {action().label}
                </button>
              )}
            </Show>
          </li>
        )}
      </For>
    </ol>
  )
}
