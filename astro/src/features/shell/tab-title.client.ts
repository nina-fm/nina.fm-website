import { metadata } from '~/features/metadata/metadata.store.ts'
import { TITLE } from '~/shared/site/site.ts'
import { TAB_TITLE_INTERVAL_MS, nextTabTitle } from './tab-title.ts'

/** Fait tourner le titre de l'onglet (`tab-title.ts`). Renvoie de quoi arrêter. */
export function rotateTabTitle(): () => void {
  const interval = setInterval(() => {
    const onAir = metadata.onAir().metadata
    document.title = nextTabTitle(document.title, TITLE, onAir?.name, onAir?.authors_text)
  }, TAB_TITLE_INTERVAL_MS)
  return () => clearInterval(interval)
}
