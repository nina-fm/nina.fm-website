/**
 * Le logo Nina.fm, quand rien ne donne de pochette (morceau seul, rien à l'antenne) :
 * les icônes de l'app (`public/maskable_icon_x<taille>.png`), chacune à sa taille
 * réelle, comme une pochette en plusieurs tailles. L'iPhone n'affichait pas l'ancien
 * repli, un seul PNG à palette de 1024 px, ni en mini ni en grand.
 */
export const DEFAULT_ARTWORK_SIZES = [96, 128, 192, 384, 512]
const defaultArtworkPath = (size: number): string => `/maskable_icon_x${size}.png`
/** L'image d'une radio sans pochette propre : remplacée par toutes les tailles du logo. */
export const DEFAULT_ARTWORK_FILENAME = defaultArtworkPath(512)
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
 * @param filepath - URL de la cover (optionnelle, repli sur le logo Nina.fm)
 * @param origin   - window.location.origin, passé explicitement pour la testabilité
 */
export function getArtwork(filepath: unknown, origin: string): MediaImage[] {
  const raw = typeof filepath === 'string' ? filepath : ''
  if (!raw || raw === DEFAULT_ARTWORK_FILENAME) {
    return DEFAULT_ARTWORK_SIZES.map((size) => ({
      src: `${origin}${defaultArtworkPath(size)}`,
      sizes: `${size}x${size}`,
      type: 'image/png',
    }))
  }
  const src = raw.startsWith('/') ? `${origin}${raw}` : raw
  const type = imageType(src)
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
