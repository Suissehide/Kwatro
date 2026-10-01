import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.game.findMany({
      include: { formats: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    })
  }
}
