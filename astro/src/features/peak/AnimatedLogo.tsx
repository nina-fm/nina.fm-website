/**
 * Le logo tracé de Peak (`AnimatedLogo.vue`, `assets/svg/logo-stroke.svg`) : ses lettres se
 * dessinent au chargement (`init`), jusqu'au premier survol ; il s'écarte du panneau
 * ouvert. Les traits sont animés dans `peak.css`.
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
      <svg
        class="hover:opacity-20"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 241.63 124.65"
        fill="none"
        stroke="currentColor"
        stroke-width="0.4em"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path class="line letter-n main-word" d="M3.16,62.44H71.89V34.34a8,8,0,1,1,16.09,0v70.49" />
        <line class="line letter-i main-word" x1="104.42" x2="104.42" y1="91.07" y2="39.89" />
        <line class="line letter-i-dot" x1="104.42" x2="104.42" y1="24.00" y2="24.01" />
        <path class="line letter-n2 main-word" d="M121,121.49V11.21a8,8,0,1,1,16.09,0V84.09" />
        <path class="line letter-a main-word" d="M153.62,97.22V34.34a8,8,0,1,1,16.09,0v28.1h68.76" />
        <line class="line letter-a-bar main-word" x1="154" x2="169" y1="49.2" y2="49.2" />
        <g stroke-width="0.15em">
          <line class="line dot-fm sub-word" x1="170.3" x2="170.3" y1="98.29" y2="98.26" />
          <path class="line letter-f sub-word" d="M183.22,98.47V82.76a2.48,2.48,0,0,1,5,0v4.79" />
          <line class="line letter-f-bar sub-word" x1="184" x2="186.69" y1="92.03" y2="92.03" />
          <path
            class="line letter-m sub-word"
            d="M193,98.47V82.76a2.47,2.47,0,0,1,2.48-2.47,2.73,2.73,0,0,1,2.76,2.47l-.28,15.71V82.76a2.48,2.48,0,0,1,5,0V98.47"
          />
        </g>
      </svg>
    </div>
  )
}
