import { meSchema } from '@kwatro/shared'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/auth.decorators'
import { ZodResponse } from '../common/zod'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @ZodResponse(meSchema)
  async me(@CurrentUser() user: User) {
    const main = await this.prisma.playerGameProfile.findFirst({
      where: { userId: user.id },
      orderBy: [{ rankedGames: 'desc' }, { kwote: 'desc' }],
      include: { format: { include: { game: true } } },
    })
    return {
      ...user,
      mainKwote: main
        ? { game: main.format.game.name, format: main.format.name, kwote: main.kwote }
        : null,
    }
  }
}
