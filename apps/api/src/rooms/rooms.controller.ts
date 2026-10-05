import {
  createdRoomSchema,
  createRoomSchema,
  type HostAction,
  hostActionSchema,
  roomDetailSchema,
} from '@kwatro/shared'
import { Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { z } from 'zod'
import { CurrentUser, Public } from '../auth/auth.decorators'
import { ZodBody, ZodResponse } from '../common/zod'
import type { User } from '../generated/prisma/client'
import { RoomsService } from './rooms.service'

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  /** Créer une room (C1-C3). 400 avec le motif si une règle n'est pas respectée (lieu fermé, mineurs…). */
  @Post()
  @ZodResponse(createdRoomSchema, 201)
  create(
    @CurrentUser() user: User,
    @ZodBody(createRoomSchema) body: z.output<typeof createRoomSchema>,
  ) {
    return this.rooms.create(user, body)
  }

  /** Fiche room (B6). Public ; connecté : sa place dans la room, et les candidatures s'il est l'hôte. */
  @Public()
  @Get(':id')
  @ZodResponse(roomDetailSchema)
  detail(@Param('id') id: string, @CurrentUser() user?: User) {
    return this.rooms.detail(id, user ?? null)
  }

  /** Demander à rejoindre. 409 avec le motif si c'est impossible (room commencée, demande refusée…). */
  @Post(':id/participation')
  @ZodResponse(roomDetailSchema, 201)
  join(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rooms.join(id, user)
  }

  /** Quitter la room, ou retirer sa demande. */
  @Delete(':id/participation')
  @ZodResponse(roomDetailSchema)
  leave(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rooms.leave(id, user)
  }

  /** Hôte : accepter une demande (ou un joueur en liste d'attente) s'il reste une place. */
  @Post(':id/candidates/:userId/accept')
  @ZodResponse(roomDetailSchema, 201)
  accept(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: User) {
    return this.rooms.decide(id, user, userId, true)
  }

  /** Hôte : refuser une demande. Le joueur ne peut plus redemander pour cette room. */
  @Post(':id/candidates/:userId/decline')
  @ZodResponse(roomDetailSchema, 201)
  decline(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: User) {
    return this.rooms.decide(id, user, userId, false)
  }

  /** Hôte : retirer un joueur, transférer le rôle d'hôte, fermer / rouvrir les inscriptions, annuler. */
  @Post(':id/host-action')
  @ZodResponse(roomDetailSchema, 201)
  hostAction(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @ZodBody(hostActionSchema) action: HostAction,
  ) {
    return this.rooms.hostAction(id, user, action)
  }
}
