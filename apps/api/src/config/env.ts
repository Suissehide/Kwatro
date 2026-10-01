import { config } from 'dotenv'

// Lit apps/api/.env s'il existe, sinon le .env à la racine du monorepo
config({ path: ['.env', '../../.env'], quiet: true })

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.string().url(),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3001,http://localhost:8081')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
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
