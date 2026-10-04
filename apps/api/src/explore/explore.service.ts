import type {
  EventsQuery,
  eventListItemSchema,
  GeoQuery,
  roomListItemSchema,
  VenueListItem,
  venueDetailSchema,
} from '@kwatro/shared'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { z } from 'zod'
import { PrismaService } from '../prisma/prisma.service'
import { compareByDistance, openingStatus } from './explore.rules'

const DAY_MS = 24 * 60 * 60 * 1000

@Injectable()
export class ExploreService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lieux à moins de `radiusKm` du point, avec leur distance en mètres (PostGIS, index GiST). */
  private async distances({ lat, lng, radiusKm }: GeoQuery) {
    const rows = await this.prisma.$queryRaw<{ id: string; distance: number }[]>`
      SELECT "id", ST_Distance("location", ST_MakePoint(${lng}::float8, ${lat}::float8)::geography) AS distance
      FROM "Venue"
      WHERE ST_DWithin("location", ST_MakePoint(${lng}::float8, ${lat}::float8)::geography, ${radiusKm * 1000}::float8)`
    return new Map(rows.map((row) => [row.id, Math.round(Number(row.distance))]))
  }

  /** Carte et liste des lieux : tri honnête (distance, partenaires en premier à distance égale). */
  async venues(query: GeoQuery): Promise<VenueListItem[]> {
    const distances = await this.distances(query)
    const now = new Date()
    const venues = await this.prisma.venue.findMany({
      where: { id: { in: [...distances.keys()] } },
      include: {
        openingHours: true,
        _count: { select: { events: { where: { startsAt: { gte: now }, cancelledAt: null } } } },
      },
    })
    return venues
      .map(({ openingHours, _count, ...venue }) => ({
        ...venue,
        distanceMeters: distances.get(venue.id) ?? 0,
        ...openingStatus(openingHours, now),
        upcomingEventCount: _count.events,
      }))
      .sort(compareByDistance)
  }

  /** Fiche lieu : infos pratiques, horaires, jeux sur place et événements des 30 prochains jours. */
  async venue(slug: string): Promise<z.output<typeof venueDetailSchema>> {
    const now = new Date()
    const venue = await this.prisma.venue.findUnique({
      where: { slug },
      include: {
        openingHours: { orderBy: [{ weekday: 'asc' }, { opensAtMinute: 'asc' }] },
        games: { select: { slug: true, name: true }, orderBy: { name: 'asc' } },
        events: {
          where: {
            startsAt: { gte: now, lt: new Date(now.getTime() + 30 * DAY_MS) },
            cancelledAt: null,
          },
          orderBy: { startsAt: 'asc' },
          include: {
            games: { select: { slug: true, name: true }, orderBy: { name: 'asc' } },
            _count: { select: { registrations: { where: { status: 'REGISTERED' } } } },
          },
        },
      },
    })
    if (!venue) throw new NotFoundException('Lieu introuvable')
    return {
      ...venue,
      ...openingStatus(venue.openingHours, now),
      events: venue.events.map(({ _count, ...event }) => ({
        ...event,
        registeredCount: _count.registrations,
      })),
    }
  }

  /** Agenda des prochains jours autour du point : trié par date, puis distance (même règle que les lieux). */
  async events(query: EventsQuery): Promise<z.output<typeof eventListItemSchema>[]> {
    const distances = await this.distances(query)
    const now = new Date()
    const events = await this.prisma.event.findMany({
      where: {
        venueId: { in: [...distances.keys()] },
        startsAt: { gte: now, lt: new Date(now.getTime() + query.days * DAY_MS) },
        cancelledAt: null,
      },
      include: {
        games: { select: { slug: true, name: true }, orderBy: { name: 'asc' } },
        venue: { select: { id: true, slug: true, name: true, isPartner: true } },
        _count: { select: { registrations: { where: { status: 'REGISTERED' } } } },
      },
    })
    return events
      .map(({ _count, venue, ...event }) => ({
        ...event,
        registeredCount: _count.registrations,
        venue: { ...venue, distanceMeters: distances.get(venue.id) ?? 0 },
      }))
      .sort(
        (a, b) =>
          a.startsAt.getTime() - b.startsAt.getTime() || compareByDistance(a.venue, b.venue),
      )
  }

  async rooms(query: EventsQuery): Promise<z.output<typeof roomListItemSchema>[]> {
    const distances = await this.distances(query)
    const now = new Date()
    // ponytail: rooms à domicile exclues (zone floue à afficher, KWT des rooms à domicile)
    const rooms = await this.prisma.room.findMany({
      where: {
        status: 'OPEN',
        venueId: { in: [...distances.keys()] },
        startsAt: { gte: now, lt: new Date(now.getTime() + query.days * DAY_MS) },
      },
      include: {
        game: { select: { slug: true, name: true } },
        format: { select: { name: true } },
        venue: { select: { id: true, name: true, isPartner: true } },
        participants: {
          where: { status: 'ACCEPTED' },
          orderBy: { createdAt: 'asc' },
          select: { user: { select: { pseudo: true, gameProfiles: true } } },
        },
      },
    })
    return rooms
      .flatMap(({ venue, format, participants, ...room }) => {
        if (!venue) return []
        const kwotes = participants.flatMap(({ user }) =>
          user.gameProfiles.filter((p) => p.formatId === room.formatId).map((p) => p.kwote),
        )
        return [
          {
            ...room,
            format: format?.name ?? null,
            venue: { ...venue, distanceMeters: distances.get(venue.id) ?? 0 },
            players: participants.map(({ user }) => ({ initial: user.pseudo.slice(0, 1) })),
            kwoteRange:
              room.mode === 'RANKED' && kwotes.length
                ? { min: Math.min(...kwotes), max: Math.max(...kwotes) }
                : null,
          },
        ]
      })
      .sort(
        (a, b) =>
          a.startsAt.getTime() - b.startsAt.getTime() || compareByDistance(a.venue, b.venue),
      )
  }
}
