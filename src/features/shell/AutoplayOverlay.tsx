import { Match, Show, Switch } from 'solid-js'
import { BUTTON_BASE } from '~/shared/ui/button.ts'
import AnimatedLoader from './AnimatedLoader.tsx'
import { listen, relaunch } from './actions.client.ts'
import type { OverlayView } from './listening.ts'
import Icon from '~/shared/ui/Icon.tsx'

interface Props {
  view: OverlayView
  relaunch: boolean
}

/**
 * Le calque posé sur la scène tant qu'elle ne joue pas (`AudioControlOverlay.vue`) :
 * voile flouté, chargement, ou gros bouton lecture si l'autoplay est refusé. Un clic
 * n'importe où sur lui lance alors l'écoute, une seule fois : la prod la lançait deux
 * fois d'un clic sur le bouton, lui et le calque l'écoutant chacun. Il disparaît en
 * fondu, mais apparaît d'un coup.
 */
export default function AutoplayOverlay(props: Props) {
  const hidden = () => props.view === 'hidden'
  return (
    <div
      class="absolute inset-0 z-50 flex items-center justify-center"
      classList={{ 'pointer-events-none opacity-0 transition-opacity duration-300': hidden() }}
      data-testid="autoplay-overlay"
      onClick={() => props.view === 'play' && listen()}
    >
      <div class="bg-background/50 absolute inset-0 z-0 backdrop-blur-[2px]" />
      <Switch>
        <Match when={props.view === 'loader'}>
          <AnimatedLoader />
        </Match>
        <Match when={props.view === 'play'}>
          <button
            type="button"
            aria-label="Lancer la radio"
            data-testid="play"
            class={`${BUTTON_BASE} text-primary hover:text-accent-foreground absolute size-40 rounded-md px-4 py-2 text-sm opacity-60 transition-opacity duration-300 ease-in-out hover:bg-transparent hover:opacity-80 [&_svg]:size-40 [&_svg_polygon]:fill-current`}
          >
            <Icon name="circle-play" />
          </button>
        </Match>
      </Switch>
      <Show when={props.relaunch && !hidden()}>
        <button
          type="button"
          aria-label="Relancer le flux"
          class={`${BUTTON_BASE} text-primary hover:bg-foreground/10 hover:text-accent-foreground absolute bottom-20 left-1/2 h-9 w-9 -translate-x-1/2 rounded-full text-sm transition-colors [&_svg]:size-4`}
          onClick={(event) => {
            event.stopPropagation()
            relaunch()
          }}
        >
          <Icon name="refresh-cw" class="size-4" />
        </button>
      </Show>
    </div>
  )
}
