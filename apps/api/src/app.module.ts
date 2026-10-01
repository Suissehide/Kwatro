import { Module } from '@nestjs/common'
import { GamesModule } from './games/games.module'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [PrismaModule, HealthModule, GamesModule],
})
export class AppModule {}
