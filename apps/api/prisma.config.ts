import { config } from 'dotenv'

// Lit apps/api/.env s'il existe, sinon le .env à la racine du monorepo
config({ path: ['.env', '../../.env'], quiet: true })

import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
