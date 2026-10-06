import { config } from 'dotenv'

// Lit apps/api/.env s'il existe, sinon le .env à la racine du monorepo
config({ path: ['.env', '../../.env'], quiet: true })

import { z } from 'zod'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().default(3000),
    DATABASE_URL: z.string().url(),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:3010,http://localhost:8081')
      .transform((value) => value.split(',').map((origin) => origin.trim())),
    /** Dev uniquement : l'en-tête `x-dev-user-id` vaut connexion (joueurs de démo du seed, sans mot de passe). */
    DEV_AUTH_HEADER: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    /** URL publique de l'API, base des callbacks Apple / Google. */
    BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
    /** Clé de signature des sessions (32 caractères min.) ; Better Auth refuse de démarrer sans en production. */
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    /** Services ID Apple (ex. fr.lucko.app.signin) et son secret JWT signé avec la clé .p8. */
    APPLE_CLIENT_ID: z.string().optional(),
    APPLE_CLIENT_SECRET: z.string().optional(),
    /** Jeton d'accès Expo, seulement si la sécurité des push est activée sur le projet Expo. */
    EXPO_ACCESS_TOKEN: z.string().optional(),
  })
  .refine((env) => !(env.NODE_ENV === 'production' && env.DEV_AUTH_HEADER), {
    message: 'DEV_AUTH_HEADER est interdit en production',
    path: ['DEV_AUTH_HEADER'],
  })

export type Env = z.infer<typeof envSchema>

/** Valide les variables d'environnement au démarrage : l'API refuse de démarrer si une variable manque. */
export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Variables d’environnement invalides :', z.treeifyError(parsed.error))
    process.exit(1)
  }
  return parsed.data
}
