import { PEAK_IMAGE_VARIABLES, rewritten } from './images.ts'

/**
 * Au retour du réseau, redemande les images de la scène (`rewritten`) : une image
 * demandée pendant une coupure, ou un GIF de 5 Mo coupé en route, resterait sinon
 * vide jusqu'au rechargement de la page. Renvoie de quoi arrêter.
 */
export function retryImagesWhenOnline(): () => void {
  const retry = () => {
    const holder = document.querySelector<HTMLElement>('[data-peak-images]')
    if (!holder) return
    for (const name of Object.keys(PEAK_IMAGE_VARIABLES)) {
      const value = holder.style.getPropertyValue(name).trim()
      if (value) holder.style.setProperty(name, rewritten(value))
    }
  }
  window.addEventListener('online', retry)
  return () => window.removeEventListener('online', retry)
}
