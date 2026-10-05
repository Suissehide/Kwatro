import { createdRoomSchema, createRoomSchema } from '@kwatro/shared'
import { Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { z } from 'zod'
import { CurrentUser } from '../auth/auth.decorators'
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
}
