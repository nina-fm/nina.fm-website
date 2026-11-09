import { toggleMute } from '~/features/playback/mute.store.ts'
import { closeContent, closeDetails, toggleDetails } from './panels.store.ts'

/**
 * Les raccourcis de la prod, communs aux thèmes : espace coupe le son, Tab ouvre ou
 * ferme les détails de la mixtape, Échap ferme les panneaux. Renvoie de quoi arrêter.
 */
export function listenToKeys(): () => void {
  const onKey = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault()
      toggleMute()
    } else if (event.key === 'Tab') {
      event.preventDefault()
      toggleDetails()
    } else if (event.key === 'Escape') {
      closeDetails()
      closeContent()
    }
  }
  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
}
