import { type PushTokenInput, pushTokenSchema } from '@lucko/shared'
import { Controller, Delete, HttpCode, Param, Put } from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/auth.decorators'
import { ZodBody } from '../common/zod'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

/** Jetons Expo Push des appareils du joueur connecté (KWT-108). */
@ApiTags('push')
@Controller('me/push-tokens')
export class PushController {
  constructor(private readonly prisma: PrismaService) {}

  /** Enregistre l'appareil ; un appareil déjà connu passe au joueur qui s'y connecte. */
  @Put()
  @HttpCode(204)
  @ApiNoContentResponse()
  async register(@CurrentUser() user: User, @ZodBody(pushTokenSchema) { token }: PushTokenInput) {
    await this.prisma.pushToken.upsert({
      where: { token },
      create: { token, userId: user.id },
      update: { userId: user.id },
    })
  }

  /** Oublie l'appareil (déconnexion) : il ne reçoit plus rien pour ce joueur. */
  @Delete(':token')
  @HttpCode(204)
  @ApiNoContentResponse()
  async forget(@CurrentUser() user: User, @Param('token') token: string) {
    await this.prisma.pushToken.deleteMany({ where: { token, userId: user.id } })
  }
}
