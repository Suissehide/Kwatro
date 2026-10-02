import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { GamesModule } from './games/games.module'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, GamesModule, UsersModule],
})
export class AppModule {}
