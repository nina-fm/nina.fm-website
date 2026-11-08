import { Show } from 'solid-js'
import { closeDetails } from '~/features/shell/panels.store.ts'
import Cover from './Cover.tsx'
import Disk from './Disk.tsx'
import LcdCounter from './LcdCounter.tsx'
import ToneArm from './ToneArm.tsx'
import { useVinylScene } from './scene.store.ts'

/**
 * La scène de Vinyl (`themes/vinyl/pages/index.vue`) : la platine, dessinée sur le
 * canevas de 900 px et mise à l'échelle, puis la pochette de la mixtape. Elle s'efface
 * vers la gauche quand le contenu s'ouvre.
 */
export default function Scene() {
  const scene = useVinylScene()
  return (
    <Show when={scene.mounted()}>
      <div
        class="absolute inset-0 transition-all duration-300 ease-in-out"
        classList={{ 'right-full border-r border-muted md:right-1/2': scene.content() }}
      >
        <div class="bg-primary relative z-0 h-full w-full overflow-hidden">
          <div
            class="absolute top-1/2 left-1/2 -ml-10 origin-top-left sm:ml-0"
            style={{ transform: `scale(${scene.scale()}) translate(-50%, -50%)` }}
          >
            <Disk title={scene.onAir()?.name} artist={scene.onAir()?.authors_text} spinning={scene.spinning()} />
            <ToneArm angle={scene.armAngle()} transition={scene.armTransition()} />
            <LcdCounter count={scene.listeners()} />
          </div>
        </div>
        <Show when={scene.details()}>
          <div
            class="absolute inset-0"
            onClick={(event) => (event.preventDefault(), event.stopPropagation(), closeDetails())}
          />
        </Show>
        <div class="pointer-events-none absolute inset-0">
          <Show when={scene.mixtape() && scene.onAir()}>
            {(onAir) => (
              <Cover
                onAir={onAir()}
                details={scene.details()}
                content={scene.content()}
                turned={scene.turned()}
                scale={scene.scale()}
                onTurn={scene.turn}
              />
            )}
          </Show>
        </div>
      </div>
    </Show>
  )
}
