import { z } from 'zod'
import { USER_ROLES } from '../constants'

/** E-mail saisi par un joueur (connexion, liste d'attente) : nettoyé et mis en minuscules. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Adresse e-mail invalide' }).max(254))

/** Mot de passe à la création du compte (8 caractères minimum, comme Better Auth par défaut). */
export const PASSWORD_MIN = 8
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, { message: `Au moins ${PASSWORD_MIN} caractères` })
  .max(128, { message: '128 caractères maximum' })

/** Profil du joueur connecté (GET /me). Ne jamais y ajouter de donnée d'un autre joueur. */
export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  pseudo: z.string(),
  role: z.enum(USER_ROLES),
  city: z.string().nullable(),
  xp: z.number().int(),
  /** Kwote du format le plus joué en classé (null sans profil TCG). */
  mainKwote: z.object({ game: z.string(), format: z.string(), kwote: z.number().int() }).nullable(),
})

export type Me = z.infer<typeof meSchema>
