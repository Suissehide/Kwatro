import { meSchema } from '@kwatro/shared'
import { Controller, Delete, Get, HttpCode } from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
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
          pseudo: `supprime-${user.id}`,
          // Champ obligatoire : date neutre à la place de la vraie
          birthDate: new Date(0),
          city: null,
          parentId: null,
          parentalConsentAt: null,
          deletedAt: now,
        },
      }),
    ])
  }
}
