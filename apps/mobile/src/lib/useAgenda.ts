import type { AgendaItem } from '@kwatro/shared'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { api } from './api'

export type Agenda = { upcoming: AgendaItem[]; past: AgendaItem[] }

/** Mes parties, à venir et historique, rechargées à chaque retour sur l'écran. */
export function useAgenda() {
  const [agenda, setAgenda] = useState<Agenda | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(() => {
    setFailed(false)
    Promise.all([
      api.GET('/me/agenda', { params: { query: { period: 'upcoming' } } }),
      api.GET('/me/agenda', { params: { query: { period: 'past' } } }),
    ])
      .then(([upcoming, past]) => {
        if (!upcoming.data || !past.data) throw new Error('Réponse invalide')
        setAgenda({ upcoming: upcoming.data, past: past.data })
      })
      .catch(() => setFailed(true))
  }, [])

  useFocusEffect(load)
  return { agenda, failed, retry: load }
}
