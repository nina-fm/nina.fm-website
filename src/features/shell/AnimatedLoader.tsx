/**
 * Les deux anneaux du chargement (`AnimatedLoader.vue`), centrés par `inset-0 m-auto`
 * et grossis autour de leur centre. La prod les centrait par `translate` avec
 * `origin-bottom-right` : en Tailwind 3, le `transform: scale(2)` de `ping` remplaçait
 * la translation, ce qui revenait au même. En Tailwind 4, `translate` est une propriété
 * à part qui reste : chaque anneau grossissait autour de son coin, hors du centre.
 */
export default function AnimatedLoader() {
  return (
    <div class="relative size-10" data-testid="loader">
      <div class="border-primary absolute inset-0 m-auto size-8 animate-ping rounded-full border-4 delay-300" />
      <div class="border-primary absolute inset-0 m-auto size-10 animate-ping rounded-full border-4" />
    </div>
  )
}
