/** La barre de progression shadcn de la prod (reka-ui) ; `class` remplace sa hauteur. */
export default function Progress(props: { value: number; class?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={props.value}
      class={`bg-primary/20 relative w-full overflow-hidden rounded-full ${props.class ?? 'h-2'}`}
    >
      <div
        class="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - props.value}%)` }}
      />
    </div>
  )
}
