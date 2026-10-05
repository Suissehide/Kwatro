import type { CreateRoomInput, RoomDetail } from '@kwatro/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AGENDA, EXPLORE, ROOM, VENUE } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { queryClient, unwrap } from '@/lib/queryClient'

// * QUERIES

export const roomQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [ROOM.GET, id],
    queryFn: () => unwrap(api.GET('/rooms/{id}', { params: { path: { id } } })),
  })

export const useRoomQuery = (id: string) => useQuery(roomQueryOptions(id))

/** Une room change : Mes parties, l'accueil et la fiche du lieu (places restantes) aussi. */
const refreshLists = () =>
  Promise.all(
    [AGENDA.GET, EXPLORE.TONIGHT, VENUE.GET].map((key) =>
      queryClient.invalidateQueries({ queryKey: [key] }),
    ),
  )

// * MUTATIONS

export function useRoomMutations() {
  /** POST /rooms : ApiError 400 avec le motif (lieu fermé, format, mineurs…). */
  const createRoom = useMutation({
    mutationKey: [ROOM.CREATE],
    mutationFn: (body: CreateRoomInput) => unwrap(api.POST('/rooms', { body })),
    onSuccess: refreshLists,
  })

  return { createRoom }
}

/** Demander à rejoindre, quitter ; pour l'hôte, accepter ou refuser une demande (ApiError 409 avec le motif). */
export function useParticipationMutations(id: string) {
  const client = useQueryClient()
  const path = { params: { path: { id } } }
  // La fiche prend la réponse de l'API
  const onSuccess = (room: RoomDetail) => {
    client.setQueryData(roomQueryOptions(id).queryKey, room)
    void refreshLists()
  }

  const join = useMutation({
    mutationKey: [ROOM.JOIN, id],
    mutationFn: () => unwrap(api.POST('/rooms/{id}/participation', path)),
    onSuccess,
  })

  const leave = useMutation({
    mutationKey: [ROOM.LEAVE, id],
    mutationFn: () => unwrap(api.DELETE('/rooms/{id}/participation', path)),
    onSuccess,
  })

  const decide = useMutation({
    mutationKey: [ROOM.DECIDE, id],
    mutationFn: ({ userId, accept }: { userId: string; accept: boolean }) => {
      const params = { params: { path: { id, userId } } }
      return unwrap(
        accept
          ? api.POST('/rooms/{id}/candidates/{userId}/accept', params)
          : api.POST('/rooms/{id}/candidates/{userId}/decline', params),
      )
    },
    onSuccess,
  })

  return { join, leave, decide }
}
