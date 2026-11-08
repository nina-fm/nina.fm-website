import { type IconName, ICONS } from './icons.ts'

/** Une icône lucide de la prod (`icons.ts`), décorative : le bouton qui la porte se nomme. */
export default function Icon(props: { name: IconName; class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={`lucide lucide-${props.name} ${props.class ?? ''}`}
      // eslint-disable-next-line solid/no-innerhtml -- tracés constants du projet (`icons.ts`)
      innerHTML={ICONS[props.name]}
    />
  )
}
