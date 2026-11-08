import { createSignal } from 'solid-js'
import { DAYLIGHT_POLL_INTERVAL, isDayTime } from './daylight.ts'

/** La nuit à l'heure de l'auditeur, relevée toutes les 10 s comme dans la prod. */

const [night, setNight] = createSignal(false)

export const daylight = { night }

/** Relève l'heure dès maintenant, puis à intervalle régulier. Renvoie de quoi arrêter. */
export function followDaylight(): () => void {
  const update = () => setNight(!isDayTime(new Date().getHours()))
  update()
  const interval = setInterval(update, DAYLIGHT_POLL_INTERVAL)
  return () => clearInterval(interval)
}
