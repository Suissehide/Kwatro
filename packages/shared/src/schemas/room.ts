import { z } from 'zod'
import { ROOM_MODES } from '../constants'

/** Données envoyées par l'app pour créer une room. Validées aussi côté API. */
export const createRoomSchema = z
  .object({
    gameId: z.string().min(1),
    formatId: z.string().min(1).optional(),
    mode: z.enum(ROOM_MODES),
    venueId: z.string().min(1).optional(),
    atHome: z.boolean().default(false),
    startsAt: z.coerce.date(),
    capacity: z.number().int().min(2).max(16),
    minorsAllowed: z.boolean().default(false),
    autoAccept: z.boolean().default(false),
    description: z.string().max(1000).optional(),
  })
  .refine((room) => room.atHome || room.venueId, {
    message: 'Une room a lieu dans un lieu ou à domicile',
    path: ['venueId'],
  })
  .refine((room) => !(room.atHome && room.autoAccept), {
    message: "Les rooms à domicile sont toujours sur acceptation de l'hôte",
    path: ['autoAccept'],
  })

export type CreateRoomInput = z.infer<typeof createRoomSchema>
