/**
 * Un enregistrement WAV silencieux, joué en boucle pour qu'un iPhone verrouillé
 * ne suspende pas la page pendant qu'une écoute se rétablit.
 *
 * Généré sur l'appareil plutôt que téléchargé : il doit jouer hors ligne, c'est
 * précisément là qu'il sert. Dix secondes : une boucle d'une seconde a été vue
 * figer un iPhone, une de dix a tenu des minutes.
 */

const SAMPLE_RATE = 8_000
const DURATION_S = 10

/** PCM mono 8 bits non signé : 128 est la ligne du zéro. */
export function silentWav(seconds = DURATION_S): Uint8Array<ArrayBuffer> {
  const samples = SAMPLE_RATE * seconds
  const bytes = new Uint8Array(44 + samples)
  const view = new DataView(bytes.buffer)
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) bytes[offset + i] = value.charCodeAt(i)
  }

  text(0, 'RIFF')
  view.setUint32(4, 36 + samples, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true) // taille du bloc fmt
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE, true) // octets par seconde
  view.setUint16(32, 1, true) // octets par bloc
  view.setUint16(34, 8, true) // bits par échantillon
  text(36, 'data')
  view.setUint32(40, samples, true)
  bytes.fill(128, 44)

  return bytes
}
