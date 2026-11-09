/** L'axe du plateau (`Sharp.vue`), au centre du sticker. */
export default function Sharp(props: { size: number; class?: string }) {
  return (
    <div
      class={`bg-secondary rounded-full ${props.class ?? ''}`}
      style={{ width: `${props.size}px`, height: `${props.size}px` }}
    >
      <div class="bg-primary/15 absolute top-1/2 left-1/2 h-[70%] w-[60%] -translate-x-[60%] -translate-y-[60%] rotate-45 rounded-full" />
      <div class="absolute-center bg-primary -mt-[10%] -ml-[16.66%] size-1/6 rounded-full" />
    </div>
  )
}
