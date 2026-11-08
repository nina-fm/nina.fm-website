/**
 * Les boutons shadcn de la prod (`app/components/ui/button`). La prod fusionnait les
 * classes de chaque usage avec `tailwind-merge`, trop lourd pour ce site : chaque usage
 * écrit ici le résultat de cette fusion, et le socle ne garde que ce que personne ne
 * remplace.
 */
export const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0'

export type ButtonVariant = 'default' | 'outline' | 'ghost'

/** Couleurs d'une variante, sans fond au survol ni ombre, que les boutons ronds remplacent. */
export const VARIANT_COLORS: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  outline: 'border border-input bg-background hover:text-accent-foreground',
  ghost: 'hover:text-accent-foreground',
}

/** Un bouton tel quel : variante et taille de shadcn, sans rien de remplacé. */
export function buttonClass(variant: ButtonVariant, size: 'default' | 'sm' | 'lg' = 'default'): string {
  const hover = {
    default: 'shadow hover:bg-primary/90',
    outline: 'shadow-sm hover:bg-accent',
    ghost: 'hover:bg-accent',
  }
  const sizes = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-8 text-sm',
  }
  return `${BUTTON_BASE} rounded-md transition-colors [&_svg]:size-4 ${VARIANT_COLORS[variant]} ${hover[variant]} ${sizes[size]}`
}

/** Les boutons ronds à icône de la coquille (`ControlButton.vue`). */
export function controlButtonClass(variant: ButtonVariant): string {
  return `${BUTTON_BASE} text-sm transition-colors h-9 w-9 shadow-none rounded-full [&_svg]:size-4 hover:bg-background/40 ${VARIANT_COLORS[variant]}`
}
