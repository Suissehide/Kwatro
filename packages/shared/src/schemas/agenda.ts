import { z } from 'zod'
import { EVENT_TYPES, ROOM_MODES } from '../constants'
import { isoDateTime } from './common'

export const AGENDA_PERIODS = ['upcoming', 'past'] as const
export type AgendaPeriod = (typeof AGENDA_PERIODS)[number]

/**
 * Place du joueur dans une partie à venir : inscrit ou en liste d'attente (événement),
 * candidature en attente, il manque des joueurs ou table complète (room). PLAYED = historique.
 */
export const AGENDA_STATUSES = [
  'REGISTERED',
  'WAITLISTED',
  'PENDING',
  'MISSING_PLAYERS',
  'FULL',
  'PLAYED',
] as const
export type AgendaStatus = (typeof AGENDA_STATUSES)[number]

export const agendaQuerySchema = z.object({
  period: z.enum(AGENDA_PERIODS).default('upcoming'),
})

/** Partie de Mes parties (D1) : événement d'un lieu ou room. */
export const agendaItemSchema = z.object({
  id: z.string(),
  kind: z.enum(['EVENT', 'ROOM']),
  eventType: z.enum(EVENT_TYPES).nullable(),
  roomMode: z.enum(ROOM_MODES).nullable(),
  title: z.string(),
  /** null : soirée tous jeux. */
  game: z.object({ slug: z.string(), name: z.string() }).nullable(),
  /** Nom du lieu, ou zone floue d'une room à domicile. */
  place: z.string().nullable(),
  startsAt: isoDateTime,
  playerCount: z.number().int(),
  capacity: z.number().int().nullable(),
  status: z.enum(AGENDA_STATUSES),
})

export type AgendaQuery = z.infer<typeof agendaQuerySchema>
/** Forme JSON reçue par l'app (dates en chaînes ISO). */
export type AgendaItem = z.input<typeof agendaItemSchema>
