import { config } from '~/shared/site/config.ts'
import { NAME } from '~/shared/site/site.ts'
import { DEFAULT_ARTWORK_FILENAME } from './artwork.ts'
import type { PlayingRadio } from './player.ts'

/**
 * L'unique flux de Nina.fm, tel que le lecteur le joue. Sans `PUBLIC_AUDIO_STREAM_URL`
 * (développement sans `.env`), l'URL est vide : l'élément tombe en erreur et le
 * lecteur le dit, un build déployé refusant de toute façon de se faire sans elle.
 */
export const NINA: PlayingRadio = {
  id: 'nina',
  name: NAME,
  streamUrl: config.audioStreamUrl ?? '',
  imageUrl: DEFAULT_ARTWORK_FILENAME,
}
