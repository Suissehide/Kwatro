import { type JoinWaitlistInput, joinWaitlistSchema } from '@lucko/shared'
import { Controller, HttpCode, Post } from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { Public } from '../auth/auth.decorators'
import { ZodBody } from '../common/zod'
import { PrismaService } from '../prisma/prisma.service'

@ApiTags('waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly prisma: PrismaService) {}

  /** Inscription à la liste d'attente. Même réponse si l'e-mail est déjà inscrit : on ne révèle pas qui l'est. */
  // ponytail: pas de limite de débit, ajouter @nestjs/throttler si la route est spammée
  @Post()
  @Public()
  @HttpCode(204)
  @ApiNoContentResponse()
  async join(@ZodBody(joinWaitlistSchema) { email, city }: JoinWaitlistInput) {
    await this.prisma.waitlistEntry.createMany({
      data: [{ email, city: city || null }],
      skipDuplicates: true,
    })
  }
}
