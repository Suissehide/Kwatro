import type { SuspendInput } from '@kwatro/shared'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PushService } from '../push/push.service'
import { planFormatMerge, planProfileMerge, suspensionEnd } from './admin.rules'

type Tx = Prisma.TransactionClient

const UPCOMING_ROOM = ['OPEN', 'FULL', 'CONFIRMED'] as const

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  /**
   * Suspend un joueur : sessions et appareils supprimés (déconnecté partout, plus de notification),
   * rooms à venir qu'il organise annulées et leurs joueurs prévenus. La connexion est refusée
   * jusqu'à la fin de la suspension (better-auth.ts).
   */
  // ponytail: pas d'e-mail au joueur suspendu (Resend pas encore branché) ; ses places dans les rooms des autres restent
  async suspend(userId: string, { reason, days }: SuspendInput, tx: Tx) {
    const user = await tx.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { role: true },
    })
    if (!user) throw new NotFoundException('Joueur introuvable')
    if (user.role === 'ADMIN') throw new ForbiddenException('Impossible de suspendre un admin')
    const now = new Date()
    await tx.user.update({
      where: { id: userId },
      data: { suspendedAt: now, suspendedUntil: suspensionEnd(days, now), suspendedReason: reason },
    })
    await tx.session.deleteMany({ where: { userId } })
    await tx.pushToken.deleteMany({ where: { userId } })
    const rooms = await tx.room.findMany({
      where: { hostId: userId, status: { in: [...UPCOMING_ROOM] }, startsAt: { gte: now } },
      select: { id: true, participants: { select: { userId: true, status: true } } },
    })
    await tx.room.updateMany({
      where: { id: { in: rooms.map((r) => r.id) } },
      data: { status: 'CANCELLED' },
    })
    for (const room of rooms) {
      await this.push.notify(
        room.participants
          .filter((p) => p.userId !== userId && p.status !== 'DECLINED' && p.status !== 'LEFT')
          .map((p) => p.userId),
        'ROOMS',
        {
          title: 'Room annulée',
          body: 'Une room où tu étais inscrit·e a été annulée.',
          url: `/rooms/${room.id}`,
        },
        tx,
      )
    }
  }

  async unsuspend(userId: string) {
    const { count } = await this.prisma.user.updateMany({
      where: { id: userId, suspendedAt: { not: null } },
      data: { suspendedAt: null, suspendedUntil: null, suspendedReason: null },
    })
    if (!count) throw new NotFoundException('Aucune suspension en cours pour ce joueur')
  }

  /** Avertissement de la modération : notification qu'on ne peut pas couper. */
  warn(userId: string, reason: string, tx: Tx) {
    return this.push.notify(
      [userId],
      null,
      { title: 'Avertissement de la modération', body: reason },
      tx,
    )
  }

  /**
   * Fusionne le jeu `sourceId` (doublon) dans `targetId` : formats, profils de jeu (Kwote), rooms,
   * événements, lieux et joueurs passent au jeu cible, puis le doublon est supprimé. Tout ou rien.
   */
  async mergeGames(sourceId: string, targetId: string) {
    if (sourceId === targetId) throw new BadRequestException('Choisis un autre jeu cible')
    await this.prisma.$transaction(async (tx) => {
      const [source, target] = await Promise.all(
        [sourceId, targetId].map((id) =>
          tx.game.findUnique({ where: { id }, include: { formats: true } }),
        ),
      )
      if (!source || !target) throw new NotFoundException('Jeu introuvable')

      const { remap, move } = planFormatMerge(source.formats, target.formats)
      for (const [from, to] of remap) {
        const [fromProfiles, toProfiles] = await Promise.all(
          [from, to].map((formatId) => tx.playerGameProfile.findMany({ where: { formatId } })),
        )
        const profiles = planProfileMerge(fromProfiles ?? [], toProfiles ?? [])
        await tx.playerGameProfile.deleteMany({ where: { id: { in: profiles.remove } } })
        await tx.playerGameProfile.updateMany({
          where: { id: { in: profiles.move } },
          data: { formatId: to },
        })
        await tx.room.updateMany({ where: { formatId: from }, data: { formatId: to } })
      }
      await tx.gameFormat.updateMany({ where: { id: { in: move } }, data: { gameId: targetId } })
      await tx.room.updateMany({ where: { gameId: sourceId }, data: { gameId: targetId } })

      // Relations plusieurs-à-plusieurs : on ajoute le jeu cible là où le doublon était
      const swap = { connect: { id: targetId }, disconnect: { id: sourceId } }
      const linked = { games: { some: { id: sourceId } } }
      for (const { id } of await tx.event.findMany({ where: linked, select: { id: true } }))
        await tx.event.update({ where: { id }, data: { games: swap } })
      for (const { id } of await tx.venue.findMany({ where: linked, select: { id: true } }))
        await tx.venue.update({ where: { id }, data: { games: swap } })
      for (const { id } of await tx.user.findMany({
        where: { playedGames: { some: { id: sourceId } } },
        select: { id: true },
      }))
        await tx.user.update({ where: { id }, data: { playedGames: swap } })

      // Il ne reste au doublon que des formats vidés, supprimés avec lui
      await tx.game.delete({ where: { id: sourceId } })
    })
  }
}
