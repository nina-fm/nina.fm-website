import { Show } from 'solid-js'
import { useRainbow } from './rainbow.store.ts'

/** Le calque du mode psychédélique (`Rainbow.vue`), au-dessus de tout et sans capter un clic. */
export default function Rainbow() {
  const rainbow = useRainbow()
  return (
    <Show when={rainbow.active()}>
      <div
        class={`pointer-events-none absolute inset-0 z-50 bg-transparent opacity-100 transition-opacity duration-300 ease-in-out ${rainbow.blend()}`}
      >
        <div
          class="pointer-events-none absolute inset-0 z-50 bg-transparent"
          style={{
            'background-color': rainbow.color(),
            'transition-property': 'background-color',
            'transition-duration': `${rainbow.duration()}ms`,
            'transition-timing-function': 'linear',
          }}
        />
      </div>
    </Show>
  )
}
