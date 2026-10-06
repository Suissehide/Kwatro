import { z } from 'zod'
import { REPORT_REASONS } from '../constants'
import { isoDateTime } from './common'

/** POST /users/:id/report : motif obligatoire, précisions facultatives. */
export const reportSchema = z.object({
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000, { message: '1000 caractères maximum' }).default(''),
})

export type ReportInput = z.input<typeof reportSchema>

/** Joueur bloqué, dans GET /me/blocks (Réglages → Joueurs bloqués). */
export const blockedPlayerSchema = z.object({
  id: z.string(),
  /** null si le compte a été supprimé depuis. */
  pseudo: z.string().nullable(),
  blockedAt: isoDateTime,
})

export type BlockedPlayer = z.infer<typeof blockedPlayerSchema>

const reportedUserSchema = z.object({ id: z.string(), pseudo: z.string().nullable() })

/** Signalement dans la file des admins (GET /admin/reports). */
export const adminReportSchema = z.object({
  id: z.string(),
  reason: z.enum(REPORT_REASONS),
  details: z.string(),
  createdAt: isoDateTime,
  reporter: reportedUserSchema,
  target: reportedUserSchema.extend({
    /** Mineur : traité en priorité. */
    minor: z.boolean(),
    /** Signalements encore ouverts sur ce joueur, celui-ci compris. */
    openReports: z.number().int(),
  }),
})

export type AdminReport = z.input<typeof adminReportSchema>
