import { Injectable } from '@nestjs/common'
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node'
import type { Request } from 'express'
import { loadEnv } from '../config/env'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { type Auth, createAuth } from './better-auth'

export type AuthRequest = Request & { user?: User }

@Injectable()
export class AuthService {
  private readonly devHeader = loadEnv().DEV_AUTH_HEADER
  readonly auth: Auth
  /** Handler Express des routes /api/auth/* (inscription, connexion, Apple, Google, déconnexion). */
  readonly handler: ReturnType<typeof toNodeHandler>

  constructor(private readonly prisma: PrismaService) {
    this.auth = createAuth(prisma, loadEnv())
    this.handler = toNodeHandler(this.auth)
  }

  /**
   * Utilisateur à l'origine de la requête (session Better Auth), ou null s'il n'est pas connecté.
   * En dev, avec DEV_AUTH_HEADER=true, l'en-tête `x-dev-user-id` connecte aussi les joueurs de démo du seed.
   */
  async resolveUser(request: Request): Promise<User | null> {
    const session = await this.auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
    const id = session?.user.id ?? (this.devHeader ? request.header('x-dev-user-id') : undefined)
    if (!id) return null
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } })
  }
}
