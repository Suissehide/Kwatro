import { type createRoomSchema, openingStatus } from '@kwatro/shared'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { z } from 'zod'
import { isMinor } from '../common/minors.rules'
import { closureRange } from '../explore/explore.service'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { createRoomRefusal } from './rooms.rules'

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crée la room ; l'hôte en est le premier joueur accepté. */
  async create(host: User, input: z.output<typeof createRoomSchema>) {
    const now = new Date()
    const [game, venue, hostOpenRooms] = await Promise.all([
      this.prisma.game.findUnique({
        where: { id: input.gameId },
        include: { formats: { select: { id: true } } },
      }),
      this.prisma.venue.findUnique({
        where: { id: input.venueId },
        include: { openingHours: true, closures: { where: { endsOn: { gte: now } } } },
      }),
      this.prisma.room.count({
        where: { hostId: host.id, status: { in: ['OPEN', 'FULL'] }, startsAt: { gte: now } },
      }),
    ])
    if (!game) throw new NotFoundException('Jeu introuvable')
    if (!venue) throw new NotFoundException('Lieu introuvable')

    const refusal = createRoomRefusal(
      input,
      {
        game: { kind: game.kind, formatIds: game.formats.map((f) => f.id) },
        venueOpen: openingStatus(
          venue.openingHours,
          venue.closures.map(closureRange),
          input.startsAt,
        ).openNow,
        hostIsMinor: isMinor(host, now),
        hostOpenRooms,
      },
      now,
    )
    if (refusal) throw new BadRequestException(refusal)

    return this.prisma.room.create({
      data: {
        ...input,
        formatId: input.formatId ?? null,
        description: input.description || null,
        hostId: host.id,
        participants: { create: { userId: host.id, status: 'ACCEPTED' } },
      },
      select: { id: true },
    })
  }
}
