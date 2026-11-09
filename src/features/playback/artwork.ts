export const DEFAULT_ARTWORK_FILENAME = '/artwork.png'
export const DEFAULT_ARTWORK_SIZE = '1024x1024'
/**
 * Types des images que l'API sert, d'après l'extension. Une table plutôt que la
 * bibliothèque `mime`, dont la base entière pesait 10 ko gzip dans l'îlot du
 * lecteur (website#77).
 */
const IMAGE_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
}

/** Type d'une image d'après l'extension de son chemin, `image/png` à défaut. */
function imageType(src: string): string {
  const extension = /\.(\w+)$/.exec(src.split(/[?#]/)[0] ?? '')?.[1]?.toLowerCase()
  return (extension && IMAGE_TYPES[extension]) ?? 'image/png'
}

export const COVER_ARTWORK_SIZES = ['96x96', '128x128', '192x192', '256x256', '384x384', '512x512']

/**
 * Retourne un tableau d'artwork MediaSession avec plusieurs tailles déclarées.
 * Les head units (voiture, etc.) sélectionnent la taille la plus adaptée.
 * Pour les covers de taille inconnue, on déclare plusieurs entrées
 * pointant vers la même URL — c'est la pratique recommandée MediaSession.
 *
 * @param filepath - URL de la cover (optionnelle, fallback sur artwork.png)
 * @param origin   - window.location.origin, passé explicitement pour la testabilité
 */
export function getArtwork(filepath: unknown, origin: string): MediaImage[] {
  const defaultArtwork = `${origin}${DEFAULT_ARTWORK_FILENAME}`
  const raw = typeof filepath === 'string' && filepath ? filepath : defaultArtwork
  const src = raw.startsWith('/') ? `${origin}${raw}` : raw
  const isDefault = src === defaultArtwork
  const type = imageType(src)

  if (isDefault) {
    return [{ src, sizes: DEFAULT_ARTWORK_SIZE, type }]
  }

  return COVER_ARTWORK_SIZES.map((sizes) => ({ src, sizes, type }))
}

/**
 * Poids au-delà duquel une pochette est remplacée par sa miniature sur l'écran
 * verrouillé (`cover.client.ts`). L'iPhone n'y affiche pas une photo de 3024 × 4032
 * (785 ko) au lancement ni en grand, mais sa miniature de 300 px partout (mesuré,
 * website#92). Seuil prudent : la limite d'iOS tient plutôt aux pixels qu'au poids.
 */
export const COVER_MAX_BYTES = 300 * 1024

/**
 * La miniature de 300 px que l'API range à côté de chaque image
 * (`files/images/<dossier>/thumb/<fichier>`), ou `null` pour une autre URL. Une
 * convention de stockage : en attendant que le flux la donne (nina-fm/nina.fm-api#82),
 * elle n'est servie qu'après avoir vérifié qu'elle existe.
 */
export function thumbnailOf(src: string): string | null {
  const match = /^(https?:\/\/[^/]+\/files\/images\/[^/]+\/)(?!thumb\/)([^/?#]+)$/.exec(src)
  return match ? `${match[1]}thumb/${match[2]}` : null
}
