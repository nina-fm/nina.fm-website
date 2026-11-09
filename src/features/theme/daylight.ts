/** Hour (exclusive) after which it is considered daytime */
export const DAY_START_HOUR = 7

/** Hour (exclusive) after which it is considered nighttime */
export const DAY_END_HOUR = 20

/** Daylight polling interval in ms */
export const DAYLIGHT_POLL_INTERVAL = 10000

/**
 * Vrai si l'heure est de jour, bornes exclues.
 * Recopiée dans le script de démarrage (`boot.ts`), qui passe les bornes : les valeurs
 * par défaut n'y sont alors jamais lues.
 */
export const isDayTime = (hour: number, start = DAY_START_HOUR, end = DAY_END_HOUR): boolean =>
  hour > start && hour < end
