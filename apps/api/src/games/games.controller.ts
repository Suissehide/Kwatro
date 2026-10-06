import { gameSchema } from '@lucko/shared'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { Public } from '../auth/auth.decorators'
import { ZodResponse } from '../common/zod'
import { GamesService } from './games.service'

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly games: GamesService) {}

  /** Catalogue des jeux et formats (exemple de module à copier pour les suivants). */
  @Get()
  @Public()
  @ZodResponse(z.array(gameSchema))
  findAll() {
    return this.games.findAll()
  }
}
