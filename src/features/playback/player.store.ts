import { createStore } from 'solid-js/store'
import {
  INITIAL_STATE,
  type MutableState,
  type PlaybackStatus,
  type Player,
  type PlayerState,
  isListening,
} from './player.ts'

/** Le store du lecteur, écrit seulement par le `Player` qu'il renvoie (`player.ts`). */
export function createPlayer(initial: PlayerState = INITIAL_STATE): Player {
  const [state, setState] = createStore<MutableState>({ ...initial })

  // Seul `request()` sort d'un état silencieux : arrêté, en pause, ou une panne
  // dont le message dit quoi faire. Tout autre signalement ne peut venir que d'un
  // événement en retard, ou du système qui touche l'élément (le bouton lecture
  // d'un casque sur un flux en panne) : l'ignorer évite d'afficher une lecture
  // fantôme.
  const idle = () => !isListening(state.status)
  const report = (status: PlaybackStatus) => () => {
    if (!idle()) setState('status', status)
  }

  return {
    get state(): PlayerState {
      return state
    },

    request(radio) {
      // Remplacer l'écoute en cours EST son interruption : un seul état, donc
      // jamais deux flux. Le statut repasse à `loading` même pour le même flux,
      // pour que l'interface ne mente jamais sur ce qui se passe.
      const played = state.played && state.radio?.id === radio.id
      setState({ radio, status: 'loading', played })
    },

    confirmPlaying() {
      if (idle()) return
      setState({ status: 'playing', played: true })
    },

    reportLoading() {
      if (idle()) return
      // Une tentative qui charge fait partie de la reconnexion : l'afficher comme
      // un premier chargement effacerait la distinction.
      if (state.status === 'reconnecting') return
      setState('status', 'loading')
    },

    reportError: report('error'),
    reportOffline: report('offline'),
    reportReconnecting: report('reconnecting'),
    reportInterrupted: report('interrupted'),
    // Seule une écoute en cours se met en pause : une panne ou une perte de réseau
    // garde son message.
    pause: report('paused'),

    stop() {
      setState({ ...INITIAL_STATE })
    },
  }
}

/**
 * Le lecteur du site. Unique par construction : un module, donc un état, partagé
 * par tous les îlots de la page et gardé d'une navigation à l'autre, puisque le
 * module n'est pas réévalué (voir `install/same-build.client.ts`).
 */
export const player = createPlayer()
