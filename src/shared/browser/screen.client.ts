/**
 * Garde l'écran allumé tant que la page est visible, comme le site Nuxt
 * (`useWakeLock` de VueUse) : le navigateur relâche le verrou quand la page se
 * masque, il est redemandé à son retour. Sans l'API, ou refusé (batterie faible,
 * page en arrière-plan), il ne se passe rien. Renvoie de quoi relâcher.
 */
export function keepScreenOn(): () => void {
  if (!('wakeLock' in navigator)) return () => undefined
  let lock: WakeLockSentinel | null = null
  const request = () => {
    if (document.visibilityState !== 'visible') return
    navigator.wakeLock.request('screen').then(
      (granted) => (lock = granted),
      () => undefined,
    )
  }
  const controller = new AbortController()
  document.addEventListener('visibilitychange', request, { signal: controller.signal })
  request()
  return () => {
    controller.abort()
    void lock?.release()
    lock = null
  }
}

/**
 * Verrouille l'écran en portrait, comme le site Nuxt. La plupart des navigateurs
 * refusent hors plein écran ou application installée, et iOS n'a pas `lock` : le
 * refus est muet.
 */
export function lockPortrait(): void {
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (orientation: 'portrait-primary') => Promise<void>
  }
  orientation.lock?.('portrait-primary').catch(() => undefined)
}
