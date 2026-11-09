import { Show } from 'solid-js'
import ControlButton from '~/features/shell/ControlButton.tsx'
import { toggleDetails } from '~/features/shell/panels.store.ts'
import Icon from '~/shared/ui/Icon.tsx'
import Equalizer from './Equalizer.tsx'
import type { PlayerLines } from './player.ts'

interface Props {
  lines: PlayerLines
  muted: boolean
  equalizerTooltip: string
  detailsOpen: boolean
}

/** Le lecteur en haut à gauche (`Player.vue`) : égaliseur, ce qui passe, et les détails. */
export default function Player(props: Props) {
  return (
    <div class="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div class="font-condensed pointer-events-auto flex h-fit max-w-[80vw] items-center gap-5 px-3 py-2.5 md:px-5 md:py-4">
        <Equalizer muted={props.muted} tooltip={props.equalizerTooltip} />
        <div class="h-5 overflow-hidden">
          <div class="relative top-0" classList={{ 'animate-[playerLoop_10s_infinite]': props.lines.type !== null }}>
            <div class="m-0 h-5 w-auto max-w-[70vw] overflow-hidden text-ellipsis whitespace-nowrap">
              <Show when={props.lines.onAir} fallback={<span>{props.lines.message}</span>}>
                {(onAir) => (
                  <span>
                    <strong class="mr-2 uppercase">{onAir().artist}</strong>
                    <span>{onAir().title}</span>
                  </span>
                )}
              </Show>
            </div>
            <div class="h-5 whitespace-nowrap">{props.lines.type}</div>
          </div>
        </div>
        <Show when={props.lines.details}>
          <ControlButton
            label={props.detailsOpen ? 'Masquer la mixtape' : 'Détails de la mixtape'}
            class="-mt-2 -mb-3"
            onClick={toggleDetails}
          >
            <Icon name={props.detailsOpen ? 'circle-minus' : 'circle-plus'} />
          </ControlButton>
        </Show>
      </div>
    </div>
  )
}
