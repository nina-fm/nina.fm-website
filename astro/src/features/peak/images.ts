import animatedNight from './images/animated-background-night.gif'
import animated from './images/animated-background.gif'
import backgroundNight from './images/background-night.jpg'
import background from './images/background.jpg'
import equalizerLoaderNight from './images/equalizer-loader-night.gif'
import equalizerLoader from './images/equalizer-loader.gif'
import equalizerNight from './images/equalizer-night.gif'
import equalizer from './images/equalizer.gif'

/**
 * Les images de la scène, choisies en CSS d'après les classes du `<body>` (`dark`,
 * `playing`) : seule celle qui s'affiche se télécharge, et les GIFs animés de 5 Mo
 * attendent la première lecture. Le build ne fige ni l'heure ni l'écoute. Servies avec
 * une empreinte (`/_astro/`), hors du précache du service worker.
 */
export const PEAK_IMAGE_VARIABLES: Record<string, string> = {
  '--peak-background': `url(${background.src})`,
  '--peak-background-night': `url(${backgroundNight.src})`,
  '--peak-background-playing': `url(${animated.src})`,
  '--peak-background-playing-night': `url(${animatedNight.src})`,
  '--peak-equalizer': `url(${equalizerLoader.src})`,
  '--peak-equalizer-night': `url(${equalizerLoaderNight.src})`,
  '--peak-equalizer-playing': `url(${equalizer.src})`,
  '--peak-equalizer-playing-night': `url(${equalizerNight.src})`,
}

/**
 * La même image, écrite autrement : `url(x)` ↔ `url("x")`. Safari ne redemande pas
 * une image de fond dont le téléchargement a échoué, hors ligne par exemple, tant que
 * la valeur reste la même ; réécrite, elle est redemandée, et une image déjà chargée
 * revient du cache mémoire sans rien télécharger (website#92).
 */
export function rewritten(value: string): string {
  const quoted = /^url\("(.*)"\)$/.exec(value)
  if (quoted) return `url(${quoted[1]})`
  const bare = /^url\((.*)\)$/.exec(value)
  return bare ? `url("${bare[1]}")` : value
}
