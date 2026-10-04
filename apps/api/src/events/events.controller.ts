import { eventDetailSchema } from '@kwatro/shared'
import { Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser, Public } from '../auth/auth.decorators'
import { ZodResponse } from '../common/zod'
import type { User } from '../generated/prisma/client'
import { EventsService } from './events.service'

/** Fiche événement (B4) et inscription dans l'app. */
@ApiTags('events')
@Controller('events/:id')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /** Public ; si le joueur est connecté, la réponse dit s'il est inscrit. */
  @Public()
  @Get()
  @ZodResponse(eventDetailSchema)
  detail(@Param('id') id: string, @CurrentUser() user?: User) {
    return this.events.detail(id, user?.id)
  }

  /** S'inscrire : inscrit, ou en liste d'attente si c'est complet. 409 si l'inscription est impossible. */
  @Post('registration')
  @ZodResponse(eventDetailSchema)
  register(@Param('id') id: string, @CurrentUser() user: User) {
    return this.events.register(id, user)
  }

  @Delete('registration')
  @ZodResponse(eventDetailSchema)
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.events.cancel(id, user)
  }
}
