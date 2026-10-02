import { Injectable } from '@nestjs/common'
import type { Request } from 'express'
import { loadEnv } from '../config/env'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

export type AuthRequest = Request & { user?: User }

@Injectable()
export class AuthService {
  private readonly devHeader = loadEnv().DEV_AUTH_HEADER

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Utilisateur à l'origine de la requête, ou null s'il n'est pas connecté.
   * ponytail: en attendant Better Auth (KWT-9), seul l'en-tête de dev `x-dev-user-id` est accepté,
   * et uniquement si DEV_AUTH_HEADER=true hors production. KWT-9 remplace ce corps par la lecture de la session.
   */
  async resolveUser(request: Request): Promise<User | null> {
    if (!this.devHeader) return null
    const id = request.header('x-dev-user-id')
    if (!id) return null
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } })
  }
}
