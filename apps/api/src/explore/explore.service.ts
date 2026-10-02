import type { EventsQuery, eventListItemSchema, GeoQuery, VenueListItem } from '@kwatro/shared'
import { Injectable } from '@nestjs/common'
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
}
