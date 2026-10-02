import { z } from 'zod'
import { USER_ROLES } from '../constants'

/** E-mail saisi par un joueur (connexion, liste d'attente) : nettoyé et mis en minuscules. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Adresse e-mail invalide' }).max(254))

/** Profil du joueur connecté (GET /me). Ne jamais y ajouter de donnée d'un autre joueur. */
export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  pseudo: z.string(),
  role: z.enum(USER_ROLES),
  city: z.string().nullable(),
  xp: z.number().int(),
})

export type Me = z.infer<typeof meSchema>
