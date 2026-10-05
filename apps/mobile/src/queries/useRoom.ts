import type { CreateRoomInput } from '@kwatro/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AGENDA, EXPLORE, ROOM, VENUE } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { unwrap } from '@/lib/queryClient'

// * MUTATIONS

export function useRoomMutations() {
  const client = useQueryClient()

  /** POST /rooms : ApiError 400 avec le motif (lieu fermé, format, mineurs…). */
  const createRoom = useMutation({
    mutationKey: [ROOM.CREATE],
    mutationFn: (body: CreateRoomInput) => unwrap(api.POST('/rooms', { body })),
    // La nouvelle room apparaît dans Mes parties, l'accueil et la fiche du lieu
    onSuccess: () =>
      Promise.all(
        [AGENDA.GET, EXPLORE.TONIGHT, VENUE.GET].map((key) =>
          client.invalidateQueries({ queryKey: [key] }),
        ),
      ),
  })

  return { createRoom }
}
