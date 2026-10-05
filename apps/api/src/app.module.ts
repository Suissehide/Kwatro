import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { EventsModule } from './events/events.module'
import { ExploreModule } from './explore/explore.module'
import { GamesModule } from './games/games.module'
import { HealthModule } from './health/health.module'
import { ModerationModule } from './moderation/moderation.module'
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
    EventsModule,
    WaitlistModule,
    ModerationModule,
  ],
})
export class AppModule {}
