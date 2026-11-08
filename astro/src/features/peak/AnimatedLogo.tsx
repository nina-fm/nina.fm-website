import LogoStroke from '~/shared/ui/LogoStroke.tsx'

/**
 * Le logo tracé de Peak (`AnimatedLogo.vue`) : ses lettres se dessinent au chargement
 * (`init`), jusqu'au premier survol ; il s'écarte du panneau ouvert. Les traits sont
 * animés dans `peak.css`.
 */
interface Props {
  init: boolean
  details: boolean
  content: boolean
  onSettle: () => void
}

export default function AnimatedLogo(props: Props) {
  const position = () => (props.details ? 'left-3/4' : props.content ? '-left-full md:left-1/4' : 'left-1/2')
  return (
    <div
      class={`peak-logo text-background dark:text-foreground absolute top-[31%] w-[150px] -translate-x-1/2 -translate-y-1/2 md:w-[200px] ${position()} ${props.init ? 'init' : ''}`}
      role="img"
      aria-label="Nina.fm"
      onMouseOver={() => props.onSettle()}
    >
      <LogoStroke class="hover:opacity-20" />
    </div>
  )
}
