import { Global, Module } from '@nestjs/common'
import { PlayIntentsController } from './play-intents.controller'
import { PlayIntentsService } from './play-intents.service'

@Global()
@Module({
  controllers: [PlayIntentsController],
  providers: [PlayIntentsService],
  exports: [PlayIntentsService],
})
export class PlayIntentsModule {}
