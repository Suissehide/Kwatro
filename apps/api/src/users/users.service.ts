import {
  type AgendaPeriod,
  type agendaItemSchema,
  KWOTE_PROVISIONAL_GAMES,
  type meSchema,
  type updateProfileSchema,
} from '@kwatro/shared'
import { ConflictException, Injectable } from '@nestjs/common'
import type { z } from 'zod'
import { Prisma, type User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { eventStatus, roomStatus, STILL_UPCOMING_MS } from './agenda.rules'

type AgendaItem = z.output<typeof agendaItemSchema>

// ponytail: historique limité aux 50 dernières parties, paginer quand un joueur en aura plus
const PAST_LIMIT = 50

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(user: User): Promise<z.output<typeof meSchema>> {
    const profiles = await this.prisma.playerGameProfile.findMany({
      where: { userId: user.id },
      orderBy: [{ rankedGames: 'desc' }, { kwote: 'desc' }],
      include: { format: { include: { game: true } } },
    })
    const main = profiles[0]
    return {
      ...user,
      hasBirthDate: user.birthDate !== null,
      mainKwote: main
        ? { game: main.format.game.name, format: main.format.name, kwote: main.kwote }
        : null,
      rankings: profiles.map((p) => ({
        game: { slug: p.format.game.slug, name: p.format.game.name },
        format: p.format.name,
        kwote: p.rankedGames < KWOTE_PROVISIONAL_GAMES ? null : p.kwote,
        rankedGames: p.rankedGames,
        reliabilityPct: p.reliabilityPct,
      })),
    }
  }

  async update(user: User, body: z.output<typeof updateProfileSchema>) {
    const data: Prisma.UserUpdateInput = { ...body }
    // Ville saisie à la main sans position : l'ancienne position ne correspond plus
    if (body.city !== undefined && body.latitude === undefined) {
      data.latitude = null
      data.longitude = null
    }
    if (body.pseudo) {
      const taken = await this.prisma.user.findFirst({
        where: { pseudo: { equals: body.pseudo, mode: 'insensitive' }, NOT: { id: user.id } },
        select: { id: true },
      })
      if (taken) throw new ConflictException('Ce pseudo est déjà pris')
    }
    try {
      return await this.prisma.user.update({ where: { id: user.id }, data })
    } catch (error) {
      // Pseudo pris entre la vérification et l'écriture
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ConflictException('Ce pseudo est déjà pris')
      throw error
    }
  }

  /** Mes parties : événements où le joueur est inscrit et rooms qu'il a rejointes ou demandées. */
  async agenda(userId: string, period: AgendaPeriod): Promise<AgendaItem[]> {
    const past = period === 'past'
    const cutoff = new Date(Date.now() - STILL_UPCOMING_MS)
    const startsAt = past ? { lt: cutoff } : { gte: cutoff }

    const [registrations, participations] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where: {
          userId,
          status: past ? 'REGISTERED' : { in: ['REGISTERED', 'WAITLISTED'] },
          event: { startsAt, cancelledAt: null },
        },
        include: {
          event: {
            include: {
              venue: { select: { name: true } },
              games: { select: { slug: true, name: true }, orderBy: { name: 'asc' } },
              _count: { select: { registrations: { where: { status: 'REGISTERED' } } } },
            },
          },
        },
        orderBy: { event: { startsAt: past ? 'desc' : 'asc' } },
        take: past ? PAST_LIMIT : undefined,
      }),
      this.prisma.roomParticipant.findMany({
        where: {
          userId,
          status: past ? 'ACCEPTED' : { in: ['PENDING', 'ACCEPTED', 'WAITLISTED'] },
          room: { startsAt, status: { not: 'CANCELLED' } },
        },
        include: {
          room: {
            include: {
              venue: { select: { name: true } },
              game: { select: { slug: true, name: true } },
              format: { select: { name: true } },
              _count: { select: { participants: { where: { status: 'ACCEPTED' } } } },
            },
          },
        },
        orderBy: { room: { startsAt: past ? 'desc' : 'asc' } },
        take: past ? PAST_LIMIT : undefined,
      }),
    ])

    const items: AgendaItem[] = [
      ...registrations.map(({ status, event }) => ({
        id: event.id,
        kind: 'EVENT' as const,
        eventType: event.type,
        roomMode: null,
        title: event.title,
        // Plusieurs jeux : le premier suffit pour le libellé et le filtre
        game: event.games[0] ?? null,
        place: event.venue.name,
        startsAt: event.startsAt,
        playerCount: event._count.registrations,
        capacity: event.capacity,
        status: past ? ('PLAYED' as const) : eventStatus(status),
      })),
      ...participations.map(({ status, room }) => ({
        id: room.id,
        kind: 'ROOM' as const,
        eventType: null,
        roomMode: room.mode,
        title: `${room.format?.name ?? room.game.name} à ${room.capacity}`,
        game: room.game,
        place: room.venue?.name ?? room.homeAreaLabel,
        startsAt: room.startsAt,
        playerCount: room._count.participants,
        capacity: room.capacity,
        status: past
          ? ('PLAYED' as const)
          : roomStatus(status, room._count.participants, room.capacity),
      })),
    ]
    const sorted = items.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    return past ? sorted.reverse().slice(0, PAST_LIMIT) : sorted
  }
}
