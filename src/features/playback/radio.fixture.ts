import type { PlayingRadio } from './player.ts'

/** Un flux pour les tests : Nina par défaut, une autre radio par `overrides`. */
export function createMockRadio(overrides: Partial<PlayingRadio> = {}): PlayingRadio {
  return {
    id: 'nina',
    name: 'Nina.fm',
    streamUrl: 'https://flux.nina.example/nina.mp3',
    imageUrl: '/_astro/nina.png',
    ...overrides,
  }
}
