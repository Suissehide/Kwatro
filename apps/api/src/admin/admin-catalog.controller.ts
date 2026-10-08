import { randomUUID } from 'node:crypto'
import {
  adminEventInputSchema,
  adminEventSchema,
  adminEventUpdateSchema,
  adminGameSchema,
  adminVenueQuerySchema,
  adminVenueSchema,
  cancelEventSchema,
  mergeGamesSchema,
  updateVenueSchema,
} from '@lucko/shared'
import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodBody, ZodQuery, ZodResponse } from '../common/zod'
import type { Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PushService } from '../push/push.service'
import { Admin } from './admin.decorators'
import { eventOccurrences } from './admin.rules'
import { AdminService } from './admin.service'

const DAY_MS = 24 * 60 * 60 * 1000
/** Agenda d'un lieu dans le back-office : les 30 derniers jours et tout ce qui vient. */
const EVENTS_PAST_DAYS = 30

const venueInclude = {
  openingHours: {
    orderBy: [{ weekday: 'asc' }, { opensAtMinute: 'asc' }],
    select: { weekday: true, opensAtMinute: true, closesAtMinute: true },
  },
  _count: { select: { photos: true } },
} satisfies Prisma.VenueInclude

const toAdminVenue = ({
  _count,
  ...venue
}: Prisma.VenueGetPayload<{ include: typeof venueInclude }>) => ({
  ...venue,
  photoCount: _count.photos,
})

const eventInclude = {
  games: { select: { id: true } },
  _count: { select: { registrations: { where: { status: 'REGISTERED' } } } },
} satisfies Prisma.EventInclude

const toAdminEvent = ({
  games,
  _count,
  ...event
}: Prisma.EventGetPayload<{ include: typeof eventInclude }>) => ({
  ...event,
  gameIds: games.map((g) => g.id),
  registered: _count.registrations,
})

/** Champs d'un événement saisi au back-office, hors dates et jeux. */
function eventData(input: z.output<typeof adminEventUpdateSchema>) {
  const { date: _date, startTime: _start, endTime: _end, gameIds: _games, ...data } = input
  return data
}

const gameRefs = (ids: string[]) => ids.map((id) => ({ id }))

/** Back-office (LKO-20) : validation des lieux, événements (démarrage à froid), fusion des jeux. */
@ApiTags('admin')
@Controller('admin')
export class AdminCatalogController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly admin: AdminService,
    private readonly push: PushService,
  ) {}

  /** Lieux, ceux en attente de validation d'abord. */
  @Get('venues')
  @Admin()
  @ZodResponse(z.array(adminVenueSchema))
  async venues(
    @ZodQuery(adminVenueQuerySchema) { q, status }: z.output<typeof adminVenueQuerySchema>,
  ) {
    const contains = { contains: q, mode: 'insensitive' } as const
    const venues = await this.prisma.venue.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q ? { OR: [{ name: contains }, { city: contains }, { address: contains }] } : {}),
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      include: venueInclude,
    })
    return venues.map(toAdminVenue)
  }

  /** Publication, passage en partenaire (badge, avantage Lucko), accès des mineurs. */
  @Patch('venues/:id')
  @Admin('VENUE_UPDATE')
  @ZodResponse(adminVenueSchema)
  async updateVenue(
    @Param('id') id: string,
    @ZodBody(updateVenueSchema) body: z.output<typeof updateVenueSchema>,
  ) {
    await this.venueOr404(id)
    return toAdminVenue(
      await this.prisma.venue.update({ where: { id }, data: body, include: venueInclude }),
    )
  }

  @Get('venues/:id/events')
  @Admin()
  @ZodResponse(z.array(adminEventSchema))
  async events(@Param('id') id: string) {
    const events = await this.prisma.event.findMany({
      where: { venueId: id, startsAt: { gte: new Date(Date.now() - EVENTS_PAST_DAYS * DAY_MS) } },
      orderBy: { startsAt: 'asc' },
      include: eventInclude,
    })
    return events.map(toAdminEvent)
  }

  /** Crée un événement, ou une série (une occurrence par semaine) avec `repeatWeeks`. */
  @Post('venues/:id/events')
  @Admin('EVENT_CREATE')
  @ZodResponse(z.array(adminEventSchema), 201)
  async createEvent(
    @Param('id') venueId: string,
    @ZodBody(adminEventInputSchema) {
      repeatWeeks,
      ...input
    }: z.output<typeof adminEventInputSchema>,
  ) {
    await this.venueOr404(venueId)
    await this.gamesOr400(input.gameIds)
    const seriesId = repeatWeeks > 0 ? randomUUID() : null
    const events = await this.prisma.$transaction(
      eventOccurrences({ ...input, repeatWeeks }).map((dates) =>
        this.prisma.event.create({
          data: {
            ...eventData(input),
            ...dates,
            venueId,
            seriesId,
            games: { connect: gameRefs(input.gameIds) },
          },
          include: eventInclude,
        }),
      ),
    )
    return events.map(toAdminEvent)
  }

  /** Modifie une occurrence (les autres dates d'une série ne bougent pas). */
  @Put('events/:id')
  @Admin('EVENT_UPDATE')
  @ZodResponse(adminEventSchema)
  async updateEvent(
    @Param('id') id: string,
    @ZodBody(adminEventUpdateSchema) input: z.output<typeof adminEventUpdateSchema>,
  ) {
    const event = await this.prisma.event.findFirst({ where: { id, cancelledAt: null } })
    if (!event) throw new NotFoundException('Événement introuvable ou annulé')
    await this.gamesOr400(input.gameIds)
    const [dates] = eventOccurrences({ ...input, repeatWeeks: 0 })
    return toAdminEvent(
      await this.prisma.event.update({
        where: { id },
        data: { ...eventData(input), ...dates, games: { set: gameRefs(input.gameIds) } },
        include: eventInclude,
      }),
    )
  }

  /** Annule l'occurrence, ou avec `series` toute la série à partir de celle-ci ; les inscrits sont prévenus. */
  @Post('events/:id/cancel')
  @Admin('EVENT_CANCEL')
  @HttpCode(204)
  @ApiNoContentResponse()
  async cancelEvent(
    @Param('id') id: string,
    @ZodBody(cancelEventSchema) { series }: z.output<typeof cancelEventSchema>,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findFirst({ where: { id, cancelledAt: null } })
      if (!event) throw new NotFoundException('Événement introuvable ou déjà annulé')
      const where =
        series && event.seriesId
          ? { seriesId: event.seriesId, startsAt: { gte: event.startsAt }, cancelledAt: null }
          : { id }
      const cancelled = await tx.event.findMany({
        where,
        select: { id: true, registrations: { where: { status: { not: 'CANCELLED' } } } },
      })
      await tx.event.updateMany({ where, data: { cancelledAt: new Date() } })
      for (const { id: eventId, registrations } of cancelled) {
        await this.push.notify(
          registrations.map((r) => r.userId),
          'VENUES',
          {
            title: 'Événement annulé',
            body: `« ${event.title} » est annulé.`,
            url: `/events/${eventId}`,
          },
          tx,
        )
      }
    })
  }

  /** Catalogue avec de quoi repérer les doublons : formats, rooms, événements et joueurs liés. */
  @Get('games')
  @Admin()
  @ZodResponse(z.array(adminGameSchema))
  async games() {
    const games = await this.prisma.game.findMany({
      orderBy: { name: 'asc' },
      include: {
        formats: { select: { id: true, slug: true, name: true }, orderBy: { name: 'asc' } },
        _count: { select: { rooms: true, events: true, players: true } },
      },
    })
    return games.map(({ _count, ...game }) => ({ ...game, ..._count }))
  }

  /** Fond le jeu `:id` (doublon) dans `intoId`, sans perte de données, puis le supprime. */
  @Post('games/:id/merge')
  @Admin('GAME_MERGE')
  @HttpCode(204)
  @ApiNoContentResponse()
  async merge(
    @Param('id') id: string,
    @ZodBody(mergeGamesSchema) { intoId }: z.output<typeof mergeGamesSchema>,
  ) {
    await this.admin.mergeGames(id, intoId)
  }

  private async venueOr404(id: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id }, select: { id: true } })
    if (!venue) throw new NotFoundException('Lieu introuvable')
  }

  private async gamesOr400(ids: string[]) {
    const count = await this.prisma.game.count({ where: { id: { in: ids } } })
    if (count !== new Set(ids).size) throw new BadRequestException('Jeu introuvable')
  }
}
