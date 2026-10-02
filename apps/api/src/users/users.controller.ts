import { meSchema } from '@kwatro/shared'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/auth.decorators'
import { ZodResponse } from '../common/zod'
import type { User } from '../generated/prisma/client'

@ApiTags('users')
@Controller()
export class UsersController {
  /** Profil du joueur connecté. */
  @Get('me')
  @ZodResponse(meSchema)
  me(@CurrentUser() user: User) {
    return user
  }
}
