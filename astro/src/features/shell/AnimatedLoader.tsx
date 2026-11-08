/** Les deux anneaux du chargement (`AnimatedLoader.vue`). */
export default function AnimatedLoader() {
  return (
    <div class="relative size-10" data-testid="loader">
      <div class="border-primary absolute top-1/2 left-1/2 size-8 origin-bottom-right -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-4 delay-300" />
      <div class="border-primary absolute top-1/2 left-1/2 size-10 origin-bottom-right -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-4" />
    </div>
  )
}
