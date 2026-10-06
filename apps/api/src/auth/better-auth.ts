import { expo } from '@better-auth/expo'
import { ageRegime, birthDateSchema, MIN_AGE, PASSWORD_MIN } from '@lucko/shared'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import type { Env } from '../config/env'
import type { PrismaClient } from '../generated/prisma/client'

/** Fournisseur actif seulement si ses deux variables sont renseignées (le dev tourne sans identifiants Apple / Google). */
function provider(clientId?: string, clientSecret?: string) {
  return clientId && clientSecret ? { clientId, clientSecret } : undefined
}

/**
 * Better Auth (KWT-9) : e-mail + mot de passe, Apple, Google ; sessions en cookie, stockées dans Postgres.
 * Routes servies sous /api/auth/* (montées dans main.ts, avant le body parser de Nest).
 */
export function createAuth(prisma: PrismaClient, env: Env) {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    // ponytail: pas de vérification d'e-mail ni de mot de passe oublié (envoi d'e-mails à brancher, Mailpit en dev)
    emailAndPassword: { enabled: true, minPasswordLength: PASSWORD_MIN },
    socialProviders: {
      google: provider(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET),
      apple: provider(env.APPLE_CLIENT_ID, env.APPLE_CLIENT_SECRET),
    },
    // Le site, l'app web Expo, le schéma de l'app native (retour après Apple / Google, `exp://` dans Expo Go en dev)
    // et le POST de retour d'Apple
    trustedOrigins: [
      ...env.CORS_ORIGINS,
      'lucko://',
      ...(env.NODE_ENV === 'production' ? [] : ['exp://']),
      'https://appleid.apple.com',
    ],
    user: {
      additionalFields: {
        // Obligatoire à l'inscription par e-mail (âge vérifié ici), posée par POST /me/birth-date après Apple / Google
        birthDate: {
          type: 'date',
          required: false,
          validator: {
            input: birthDateSchema.refine((date) => ageRegime(date) !== 'too-young', {
              message: `Lucko est ouvert dès ${MIN_AGE} ans`,
            }),
          },
        },
      },
    },
    databaseHooks: {
      user: {
        // La date de naissance règle les droits du compte : jamais modifiable via /api/auth/update-user
        update: { before: async (data) => ('birthDate' in data ? false : undefined) },
      },
    },
    plugins: [expo()],
  })
}

export type Auth = ReturnType<typeof createAuth>
