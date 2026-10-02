import {
  type EventsQuery,
  eventListItemSchema,
  eventsQuerySchema,
  type GeoQuery,
  geoQuerySchema,
  venueListItemSchema,
} from '@kwatro/shared'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { Public } from '../auth/auth.decorators'
import { ZodQuery, ZodResponse } from '../common/zod'
import { ExploreService } from './explore.service'

/** « Où jouer ce soir » (B1 carte, B2 liste). Public : aussi utilisé par le site web. */
@ApiTags('explore')
@Public()
@Controller()
export class ExploreController {
  constructor(private readonly explore: ExploreService) {}

  /** Lieux autour d'un point, du plus proche au plus loin (partenaires en premier à distance égale). */
  @Get('venues')
  @ZodResponse(z.array(venueListItemSchema))
  venues(@ZodQuery(geoQuerySchema) query: GeoQuery) {
    return this.explore.venues(query)
  }

  /** Événements des prochains jours autour d'un point, par date puis distance. */
  @Get('events')
  @ZodResponse(z.array(eventListItemSchema))
  events(@ZodQuery(eventsQuerySchema) query: EventsQuery) {
    return this.explore.events(query)
  }
}
