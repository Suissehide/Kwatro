import {
  type GeoQuery,
  gameDemandSchema,
  geoQuerySchema,
  myPlayIntentsSchema,
  type PlayIntents,
  playIntentsSchema,
} from '@lucko/shared'
import { Controller, Get, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { CurrentUser, Public } from '../auth/auth.decorators'
import { ZodBody, ZodQuery, ZodResponse } from '../common/zod'
import type { User } from '../generated/prisma/client'
import { PlayIntentsService } from './play-intents.service'

/** « Je veux jouer à… » (LKO-17). */
@ApiTags('play-intents')
@Controller()
export class PlayIntentsController {
  constructor(private readonly intents: PlayIntentsService) {}

  /** Mes envies de jeu en cours. */
  @Get('me/play-intents')
  @ZodResponse(myPlayIntentsSchema)
  mine(@CurrentUser() user: User) {
    return this.intents.mine(user.id)
  }

  /** Remplace mes envies de jeu ; elles durent PLAY_INTENT_DAYS à partir de maintenant. */
  @Put('me/play-intents')
  @ZodResponse(myPlayIntentsSchema)
  set(@CurrentUser() user: User, @ZodBody(playIntentsSchema) body: PlayIntents) {
    return this.intents.set(user.id, body)
  }

  /** Joueurs qui attendent chaque jeu autour d'un point (compteur seul, masqué sous le seuil). Public. */
  @Public()
  @Get('games/demand')
  @ZodResponse(z.array(gameDemandSchema))
  demand(@ZodQuery(geoQuerySchema) query: GeoQuery) {
    return this.intents.demand(query)
  }
}
