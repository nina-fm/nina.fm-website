import { Show } from 'solid-js'
import { mute } from '~/features/playback/mute.store.ts'
import AnimatedLogo from './AnimatedLogo.tsx'
import Audience from './Audience.tsx'
import MixtapeDetails from './MixtapeDetails.tsx'
import Player from './Player.tsx'
import { useScene } from './scene.store.ts'

/**
 * La scène de Peak au-dessus du fond (`themes/peak/pages/index.vue`), dans l'ordre de la
 * prod : constellation, lecteur, logo, détails de la mixtape.
 */
export default function Scene() {
  const scene = useScene()
  return (
    <>
      <Audience stars={scene.stars()} listeners={scene.listeners()} />
      <Show when={scene.mounted()}>
        <Player
          lines={scene.lines()}
          muted={mute.muted()}
          equalizerTooltip={scene.equalizerTooltip()}
          detailsOpen={scene.details()}
        />
        <AnimatedLogo
          init={scene.logoInit()}
          details={scene.details()}
          content={scene.content()}
          onSettle={scene.settleLogo}
        />
      </Show>
      <MixtapeDetails open={scene.details()} onAir={scene.onAir()} progress={scene.progress()} />
    </>
  )
}
