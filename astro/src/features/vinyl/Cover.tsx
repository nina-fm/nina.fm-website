import type { Metadata } from '~/features/metadata/types.ts'
import { openDetails } from '~/features/shell/panels.store.ts'
import ControlButton from '~/features/shell/ControlButton.tsx'
import Icon from '~/shared/ui/Icon.tsx'
import CoverDetails from './CoverDetails.tsx'

interface Props {
  onAir: Metadata
  details: boolean
  turned: boolean
  scale: number
  onTurn: () => void
}

/** Le coin bas-gauche quand elle est rangée, le centre de la scène quand elle est ouverte. */
const PLACES = {
  closed:
    'top-0 left-0 -translate-x-1/3 translate-y-[75vh] rotate-[6deg] cursor-pointer sm:translate-y-[65vh] md:-translate-x-3/4 md:translate-y-[70vh] lg:translate-y-[65vh]',
  open: 'top-0 left-0 translate-x-[-9%] translate-y-[10%] rotate-[-2deg] sm:translate-y-0 sm:rotate-[-12deg] md:translate-x-[-18%] md:rotate-[-4deg] lg:translate-x-[-8%] lg:translate-y-[0%] lg:rotate-[-6deg] xl:translate-x-[-5%] xl:translate-y-[0%] xl:rotate-[-8deg]',
}

/**
 * La pochette 3D de la mixtape (`Cover.vue`) : rangée, un clic l'ouvre ; ouverte, elle
 * se retourne. Tailwind 4 pose `translate`, `rotate` et `scale` en propriétés
 * distinctes : l'échelle de la scène se donne par `scale`, là où la prod réécrivait
 * le `transform` de Tailwind 3. Ouverts ensemble dans la prod, détails et contenu
 * sont exclusifs dans la coquille commune : la pochette n'a plus de place pour ce cas.
 */
export default function Cover(props: Props) {
  // Le verso l'emporte, comme `rotate-y-190` déclarée après `rotate-y-10` dans la prod.
  const rotation = () => (props.turned ? 'rotate-y-190' : props.details ? 'rotate-y-10' : 'rotate-y-0')
  return (
    <div
      class={`pointer-events-auto absolute z-10 size-[1000px] origin-top-left bg-transparent transition-all duration-700 ease-in-out perspective-[1000px] ${props.details ? PLACES.open : PLACES.closed}`}
      style={{ scale: String(props.scale) }}
      onClick={() => !props.details && openDetails()}
    >
      <div
        class={`relative size-full shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-700 ease-in-out transform-3d ${rotation()}`}
      >
        <div class="vinyl-face bg-muted absolute size-full p-12">
          <CoverDetails onAir={props.onAir} />
          <TurnButton onClick={props.onTurn} />
        </div>
        <div class="vinyl-face bg-muted absolute size-full rotate-y-180">
          <div class="bg-muted flex size-full items-center justify-center p-16">
            <img src={props.onAir.cover_url} alt="" class="relative z-10 size-full object-contain" />
          </div>
          <TurnButton onClick={props.onTurn} />
        </div>
      </div>
    </div>
  )
}

/**
 * Le bouton qui retourne la pochette (`CoverSwitchButton.vue`). Son clic s'arrête là :
 * pochette rangée, il la retourne sans l'ouvrir.
 */
function TurnButton(props: { onClick: () => void }) {
  return (
    <div class="absolute right-5 bottom-5" onClick={(event) => event.stopPropagation()}>
      <ControlButton label="Retourner la pochette" tooltip="Retourner la pochette" onClick={props.onClick}>
        <Icon name="refresh-ccw" />
      </ControlButton>
    </div>
  )
}
