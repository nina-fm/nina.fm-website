import { createSignal } from 'solid-js'

/**
 * Les toasts du site, au rendu de ceux de la prod (vue-sonner, `Notifier.vue`), sans
 * leur bibliothèque : un toast d'un même identifiant remplace le précédent, et se
 * retire seul après sa durée.
 */

export type ToastKind = 'loading' | 'success' | 'error'

export interface Toast {
  id: string
  kind: ToastKind
  message: string
  action?: { label: string; run: () => void }
}

/** Durée par défaut de la prod (`Notifier.vue`). */
export const TOAST_DURATION_MS = 5_000

const [toasts, setToasts] = createSignal<readonly Toast[]>([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()

export const toaster = {
  toasts,
  has: (id: string): boolean => toasts().some((toast) => toast.id === id),
}

/** Montre un toast ; `duration` à `null`, il reste jusqu'à `dismissToast`. */
export function showToast(toast: Toast, duration: number | null = TOAST_DURATION_MS): void {
  clearTimeout(timers.get(toast.id))
  setToasts([...toasts().filter((shown) => shown.id !== toast.id), toast])
  if (duration !== null)
    timers.set(
      toast.id,
      setTimeout(() => dismissToast(toast.id), duration),
    )
}

export function dismissToast(id: string): void {
  clearTimeout(timers.get(id))
  timers.delete(id)
  setToasts(toasts().filter((toast) => toast.id !== id))
}
