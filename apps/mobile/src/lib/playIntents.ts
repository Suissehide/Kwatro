import { type GameDemand, PLAY_INTENT_DAYS, type PlayWhen, RADIUS_KM } from '@lucko/shared'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useMeQuery } from '@/queries/useMe'
import {
  gameDemandQueryOptions,
  usePlayIntentsMutations,
  usePlayIntentsQuery,
} from '@/queries/usePlayIntents'
import { useLocation } from './useLocation'

export const PLAY_INTENTS_NOTE = `Les hôtes voient combien de joueurs attendent un jeu, jamais qui. Tes envies durent ${PLAY_INTENT_DAYS} jours.`

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`

/** « 23 joueurs l'attendent à Bordeaux » ; sous le seuil d'anonymat, pas de nombre. */
export const demandLine = (demand: GameDemand, city: string | null) =>
  demand.waitingCount === null
    ? 'Sois parmi les premiers'
    : `${plural(demand.waitingCount, 'joueur')} l'attend${demand.waitingCount > 1 ? 'ent' : ''} ${city ? `à ${city}` : 'près de toi'}`

export const followedLine = (count: number) =>
  count === 0 ? 'Aucun jeu suivi' : count === 1 ? '1 jeu suivi' : `${count} jeux suivis`

/**
 * « Je veux jouer à… » (LKO-17) : demande par jeu autour du joueur, ses envies, et l'enregistrement.
 * Sans session, enregistrer renvoie vers la connexion.
 */
export function usePlayIntents() {
  const me = useMeQuery()
  const { place, ready } = useLocation()
  const radiusKm = me?.searchRadiusKm ?? RADIUS_KM.default
  const demand = useQuery({ ...gameDemandQueryOptions(place, radiusKm), enabled: ready })
  const mine = usePlayIntentsQuery(!!me)
  const { setPlayIntents } = usePlayIntentsMutations()
  const gameIds = mine.data?.gameIds ?? []
  const when: PlayWhen = mine.data?.when ?? 'ANY'

  const save = (next: { gameIds: string[]; when: PlayWhen }) => {
    if (!me) return router.push('/auth')
    return setPlayIntents.mutateAsync(next)
  }
  const toggle = (gameId: string) =>
    save({
      gameIds: gameIds.includes(gameId)
        ? gameIds.filter((id) => id !== gameId)
        : [...gameIds, gameId],
      when,
    })

  return {
    city: me?.city ?? null,
    demand: demand.data ?? [],
    gameIds,
    when,
    loaded: !!demand.data && (!me || !!mine.data),
    save,
    toggle,
    saving: setPlayIntents.isPending,
  }
}
