import { Controller, Get } from '@nestjs/common'
import { GamesService } from './games.service'

@Controller('games')
export class GamesController {
  constructor(private readonly games: GamesService) {}

  /** Catalogue des jeux et formats (exemple de module à copier pour les suivants). */
  @Get()
  findAll() {
    return this.games.findAll()
  }
}
