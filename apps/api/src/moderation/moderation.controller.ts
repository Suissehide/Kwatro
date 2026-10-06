import { blockedPlayerSchema, reportSchema } from '@lucko/shared'
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { CurrentUser } from '../auth/auth.decorators'
import { ZodBody, ZodResponse } from '../common/zod'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Blocage et signalement (LKO-19), exigés par Apple et Google pour une app
 * où les joueurs se rencontrent. Les effets du blocage sur les listes vivent dans chaque module
 * (voir `notBlockedWith` dans explore). Les signalements sont traités dans le back-office (admin/).
 */
@ApiTags('moderation')
@Controller()
export class ModerationController {
  constructor(private readonly prisma: PrismaService) {}

  /** Autre joueur ciblé : ni soi-même, ni un compte inconnu ou supprimé. */
  private async target(me: User, id: string) {
    if (id === me.id) throw new BadRequestException('Impossible de se cibler soi-même')
    const target = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    })
    if (!target) throw new NotFoundException('Joueur introuvable')
    return target
  }

  @Get('me/blocks')
  @ZodResponse(z.array(blockedPlayerSchema))
  async blocks(@CurrentUser() user: User) {
    const blocks = await this.prisma.block.findMany({
      where: { blockerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { blocked: { select: { id: true, pseudo: true } } },
    })
    return blocks.map(({ blocked, createdAt }) => ({ ...blocked, blockedAt: createdAt }))
  }

  /** Bloque un joueur (sans effet s'il l'est déjà). */
  @Put('users/:id/block')
  @HttpCode(204)
  @ApiNoContentResponse()
  async block(@CurrentUser() user: User, @Param('id') id: string) {
    await this.target(user, id)
    await this.prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: id } },
      create: { blockerId: user.id, blockedId: id },
      update: {},
    })
  }

  @Delete('users/:id/block')
  @HttpCode(204)
  @ApiNoContentResponse()
  async unblock(@CurrentUser() user: User, @Param('id') id: string) {
    await this.prisma.block.deleteMany({ where: { blockerId: user.id, blockedId: id } })
  }

  // ponytail: pas de limite de signalements par joueur, à ajouter si la file est spammée
  @Post('users/:id/report')
  @HttpCode(204)
  @ApiNoContentResponse()
  async report(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @ZodBody(reportSchema) body: z.output<typeof reportSchema>,
  ) {
    await this.target(user, id)
    await this.prisma.report.create({ data: { ...body, reporterId: user.id, targetId: id } })
  }
}
