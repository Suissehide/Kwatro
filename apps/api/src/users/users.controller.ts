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
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
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

  /**
   * Suppression du compte (exigence Apple, RGPD) : le joueur est anonymisé et ne peut plus se connecter
   * (`deletedAt`). La ligne reste pour les venues facturées aux lieux et l'historique des parties,
   * mais plus rien ne l'identifie ; ses places à venir sont libérées.
   */
  // ponytail: les comptes enfants (13-14 ans) restent sans parent, à traiter avec le consentement parental
  @Delete('me')
  @HttpCode(204)
  @ApiNoContentResponse()
  async deleteMe(@CurrentUser() user: User) {
    const now = new Date()
    const upcoming = { startsAt: { gte: now } }
    await this.prisma.$transaction([
      this.prisma.playerGameProfile.deleteMany({ where: { userId: user.id } }),
      this.prisma.venueStaff.deleteMany({ where: { userId: user.id } }),
      // Sessions et moyens de connexion Better Auth : plus aucune connexion possible
      this.prisma.session.deleteMany({ where: { userId: user.id } }),
      this.prisma.account.deleteMany({ where: { userId: user.id } }),
      this.prisma.eventRegistration.deleteMany({ where: { userId: user.id, event: upcoming } }),
      this.prisma.roomParticipant.deleteMany({ where: { userId: user.id, room: upcoming } }),
      this.prisma.room.updateMany({
        where: { hostId: user.id, ...upcoming, status: { in: ['OPEN', 'FULL', 'CONFIRMED'] } },
        data: { status: 'CANCELLED' },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: `${user.id}@supprime.invalid`,
          name: '',
          image: null,
          pseudo: null,
          birthDate: null,
          city: null,
          parentId: null,
          parentalConsentAt: null,
          deletedAt: now,
        },
      }),
    ])
  }
}
