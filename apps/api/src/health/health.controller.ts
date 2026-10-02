import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { Public } from '../auth/auth.decorators'
import { ZodResponse } from '../common/zod'
import { PrismaService } from '../prisma/prisma.service'

const healthSchema = z.object({ status: z.literal('ok'), database: z.literal('up') })

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ZodResponse(healthSchema)
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'ok', database: 'up' }
    } catch {
      throw new ServiceUnavailableException({ status: 'error', database: 'down' })
    }
  }
}
