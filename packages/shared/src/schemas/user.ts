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

/** Date de naissance envoyée à l'API (`AAAA-MM-JJ`) → date UTC. L'âge minimum se vérifie à part (ageRegime). */
export const birthDateSchema = z.iso
  .date({ message: 'Date de naissance invalide' })
  .transform((value) => new Date(value))
  .refine((date) => date <= new Date(), { message: 'Date de naissance dans le futur' })

export const setBirthDateSchema = z.object({ birthDate: birthDateSchema })
export type SetBirthDateInput = z.infer<typeof setBirthDateSchema>

/** Profil du joueur connecté (GET /me). Ne jamais y ajouter de donnée d'un autre joueur. */
export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  /** null tant que l'onboarding (KWT-45) n'est pas fait. */
  pseudo: z.string().nullable(),
  /** false après une première connexion Apple / Google : l'app demande la date avant tout. */
  hasBirthDate: z.boolean(),
  role: z.enum(USER_ROLES),
  city: z.string().nullable(),
  xp: z.number().int(),
  /** Kwote du format le plus joué en classé (null sans profil TCG). */
  mainKwote: z.object({ game: z.string(), format: z.string(), kwote: z.number().int() }).nullable(),
})

export type Me = z.infer<typeof meSchema>
