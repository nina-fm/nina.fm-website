import { COVER_MAX_BYTES, thumbnailOf } from './artwork.ts'

/**
 * La pochette que l'écran verrouillé sait afficher : l'original, ou sa miniature
 * quand l'original est trop lourd (`COVER_MAX_BYTES`). Le poids se lit sans
 * télécharger l'image, par une requête `HEAD` ; toute incertitude (erreur,
 * miniature absente, poids inconnu) garde l'original, comme avant.
 */

/** Les originaux trop lourds, et la miniature qui les remplace. */
const lighter = new Map<string, string>()
const checked = new Set<string>()

/** La pochette à montrer pour `src`, d'après ce qu'on en sait déjà. */
export const coverFor = (src: string): string => lighter.get(src) ?? src

/** Vérifie une fois `src` ; vrai si sa miniature doit désormais la remplacer. */
export async function lightenCover(src: string): Promise<boolean> {
  const thumbnail = thumbnailOf(src)
  if (!thumbnail || checked.has(src)) return false
  checked.add(src)
  const original = await head(src)
  if (!(Number(original?.headers.get('content-length')) > COVER_MAX_BYTES)) return false
  if (!(await head(thumbnail))?.ok) return false
  lighter.set(src, thumbnail)
  return true
}

async function head(url: string): Promise<Response | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok ? response : null
  } catch {
    return null
  }
}
