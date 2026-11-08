import { toggleMute } from '~/features/playback/mute.store.ts'
import Tooltip from '~/shared/ui/Tooltip.tsx'

/**
 * L'égaliseur du lecteur (`PlayerEqualizer.vue`) : son GIF suit le jour et l'écoute
 * (`peak.css`), un clic coupe ou rend le son.
 */
export default function Equalizer(props: { muted: boolean; tooltip: string }) {
  return (
    <Tooltip content={props.tooltip}>
      <div
        role="button"
        aria-label={props.tooltip}
        class="peak-equalizer pointer-events-auto -mt-0.5 size-4 cursor-pointer bg-contain bg-center bg-no-repeat"
        classList={{ 'opacity-20': props.muted }}
        onClick={() => toggleMute()}
      />
    </Tooltip>
  )
}
