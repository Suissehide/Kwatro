import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { ExploreModule } from './explore/explore.module'
import { GamesModule } from './games/games.module'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { WaitlistModule } from './waitlist/waitlist.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    GamesModule,
    UsersModule,
    ExploreModule,
    WaitlistModule,
  ],
})
export class AppModule {}
