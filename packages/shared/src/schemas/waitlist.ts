import { z } from 'zod'

/** Inscription à la liste d'attente joueurs (landing du site). Validée aussi côté API. */
export const joinWaitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'Adresse e-mail invalide' }).max(254)),
  city: z.string().trim().max(80).optional(),
  /** RGPD : en dessous de 15 ans, le consentement doit venir d'un parent (cf. DIGITAL_MAJORITY_AGE). */
  digitalMajority: z.literal(true, { message: 'Il faut avoir 15 ans ou plus pour s’inscrire' }),
})

export type JoinWaitlistInput = z.input<typeof joinWaitlistSchema>
