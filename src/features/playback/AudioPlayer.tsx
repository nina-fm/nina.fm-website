import { useAudioPlayer } from './audio-player.store.ts'

/**
 * L'unique élément audio du site, monté dans le layout et persistant d'une
 * navigation à l'autre. Aucune page ne crée d'élément audio : elles demandent la
 * lecture à l'état partagé (`controls.client.ts`).
 */
export default function AudioPlayer() {
  const player = useAudioPlayer()
  return (
    <audio
      ref={(element) => (player.parts.audio = element)}
      // Pas d'`autoplay` : l'îlot décide de lancer l'écoute (`audio-player.store.ts`).
      // `preload="none"` : rien ne touche le réseau avant.
      preload="none"
      data-testid="audio-element"
    />
  )
}
