import { kwoteReliability, nextKwotes } from '@kwatro/shared'
import type { Prisma } from '../generated/prisma/client'

export type KwoteResult = {
  formatId: string
  /** Room classée d'origine ; absent pour un tournoi */
  roomId?: string
  /** KWOTE_TOURNAMENT_WEIGHT pour un tournoi classé */
  weight?: number
  /** Place finale de chaque joueur (1 = vainqueur, places égales = nul) */
  placements: { userId: string; place: number }[]
}

/**
 * Applique un résultat classé confirmé à la Kwote des joueurs (KWT-86, archi §13) : nouvelle
 * Kwote, parties classées, fiabilité, et une ligne d'historique par joueur. À appeler dans la
 * transaction qui confirme le résultat (rooms classées : KWT-83 ; tournois ensuite).
 */
export async function applyKwoteResult(
  tx: Prisma.TransactionClient,
  { formatId, roomId, weight, placements }: KwoteResult,
) {
  const userIds = placements.map((p) => p.userId)
  if (userIds.length < 2 || new Set(userIds).size !== userIds.length)
    throw new Error('Un résultat classé exige au moins deux joueurs distincts')

  // ponytail: tout l'historique est relu pour compter les adversaires distincts ; colonne dédiée si ça grossit
  const players = await Promise.all(
    placements.map(async ({ userId, place }) => ({
      place,
      // Joueur sans profil sur ce format (questionnaire non rempli) : départ à 1000
      profile: await tx.playerGameProfile.upsert({
        where: { userId_formatId: { userId, formatId } },
        create: { userId, formatId },
        update: {},
        include: { history: { select: { opponentIds: true } } },
      }),
    })),
  )
  const kwotes = nextKwotes(
    players.map(({ profile, place }) => ({ ...profile, place })),
    weight,
  )
  await Promise.all(
    players.map(({ profile, place }, i) => {
      const kwote = kwotes[i] ?? profile.kwote
      const opponentIds = userIds.filter((id) => id !== profile.userId)
      const opponents = new Set([...profile.history.flatMap((h) => h.opponentIds), ...opponentIds])
      const rankedGames = profile.rankedGames + 1
      return tx.playerGameProfile.update({
        where: { id: profile.id },
        data: {
          kwote,
          rankedGames,
          reliabilityPct: kwoteReliability(rankedGames, opponents.size),
          history: {
            create: { roomId, kwoteBefore: profile.kwote, kwoteAfter: kwote, place, opponentIds },
          },
        },
      })
    }),
  )
  return kwotes
}
