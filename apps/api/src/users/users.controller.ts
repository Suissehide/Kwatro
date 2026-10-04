import {
  ageRegime,
  MIN_AGE,
  meSchema,
  type SetBirthDateInput,
  setBirthDateSchema,
} from '@kwatro/shared'
import {
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/auth.decorators'
import { ZodBody, ZodResponse } from '../common/zod'
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
      hasBirthDate: user.birthDate !== null,
      mainKwote: main
        ? { game: main.format.game.name, format: main.format.name, kwote: main.kwote }
        : null,
    }
  }

  /**
   * Date de naissance après une première connexion Apple / Google (l'e-mail la donne à l'inscription).
   * Posée une seule fois. Sous l'âge minimum, le compte est supprimé : rien n'est conservé.
   */
  @Post('me/birth-date')
  @HttpCode(204)
  async setBirthDate(
    @CurrentUser() user: User,
    @ZodBody(setBirthDateSchema) { birthDate }: SetBirthDateInput,
  ) {
    if (user.birthDate) throw new ConflictException('Date de naissance déjà renseignée')
    if (ageRegime(birthDate) === 'too-young') {
      await this.prisma.user.delete({ where: { id: user.id } })
      throw new ForbiddenException(`Compte réservé aux joueurs de ${MIN_AGE} ans et plus`)
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { birthDate } })
  }
}
