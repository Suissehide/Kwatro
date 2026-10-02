import { z } from 'zod'
import { emailSchema } from './user'

/** Inscription à la liste d'attente joueurs (landing du site). Validée aussi côté API. */
export const joinWaitlistSchema = z.object({
  email: emailSchema,
  city: z.string().trim().max(80).optional(),
  /** RGPD : en dessous de 15 ans, le consentement doit venir d'un parent (cf. DIGITAL_MAJORITY_AGE). */
  digitalMajority: z.literal(true, { message: 'Il faut avoir 15 ans ou plus pour s’inscrire' }),
})

export type JoinWaitlistInput = z.input<typeof joinWaitlistSchema>
