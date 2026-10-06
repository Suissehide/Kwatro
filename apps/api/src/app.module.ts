import { Module } from '@nestjs/common'
import { AdminModule } from './admin/admin.module'
import { AuthModule } from './auth/auth.module'
import { EventsModule } from './events/events.module'
import { ExploreModule } from './explore/explore.module'
import { GamesModule } from './games/games.module'
import { HealthModule } from './health/health.module'
import { JobsModule } from './jobs/jobs.module'
import { ModerationModule } from './moderation/moderation.module'
import { PrismaModule } from './prisma/prisma.module'
import { PushModule } from './push/push.module'
import { RoomsModule } from './rooms/rooms.module'
import { UsersModule } from './users/users.module'
import { WaitlistModule } from './waitlist/waitlist.module'

@Module({
  imports: [
    PrismaModule,
    JobsModule,
    PushModule,
    AuthModule,
    HealthModule,
    GamesModule,
    UsersModule,
    ExploreModule,
    EventsModule,
    WaitlistModule,
    ModerationModule,
    RoomsModule,
    AdminModule,
  ],
})
export class AppModule {}
