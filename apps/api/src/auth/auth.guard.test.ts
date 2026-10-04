import { type ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { describe, expect, it } from 'vitest'
import type { User } from '../generated/prisma/client'
import { Public, Roles } from './auth.decorators'
import { AuthGuard } from './auth.guard'
import type { AuthRequest, AuthService } from './auth.service'

const player = { id: 'u1', role: 'PLAYER' } as User
const admin = { id: 'u2', role: 'ADMIN' } as User

class Routes {
  @Public()
  open() {}
  any() {}
  @Roles('ADMIN')
  adminOnly() {}
}

function setup(user: User | null, handler: keyof Routes) {
  const request = {} as AuthRequest
  const auth = { resolveUser: async () => user } as unknown as AuthService
  const context = {
    getHandler: () => Routes.prototype[handler],
    getClass: () => Routes,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext
  return { guard: new AuthGuard(new Reflector(), auth), context, request }
}

describe('AuthGuard', () => {
  it('laisse passer une route @Public sans utilisateur', async () => {
    const { guard, context } = setup(null, 'open')
    await expect(guard.canActivate(context)).resolves.toBe(true)
  })

  it("pose l'utilisateur connecté sur une route @Public", async () => {
    const { guard, context, request } = setup(player, 'open')
    await expect(guard.canActivate(context)).resolves.toBe(true)
    expect(request.user).toBe(player)
  })

  it('refuse par défaut une route sans utilisateur connecté (401)', async () => {
    const { guard, context } = setup(null, 'any')
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it("pose l'utilisateur sur la requête", async () => {
    const { guard, context, request } = setup(player, 'any')
    await expect(guard.canActivate(context)).resolves.toBe(true)
    expect(request.user).toBe(player)
  })

  it('applique @Roles : 403 pour un joueur, accès pour un admin', async () => {
    const asPlayer = setup(player, 'adminOnly')
    await expect(asPlayer.guard.canActivate(asPlayer.context)).rejects.toBeInstanceOf(
      ForbiddenException,
    )
    const asAdmin = setup(admin, 'adminOnly')
    await expect(asAdmin.guard.canActivate(asAdmin.context)).resolves.toBe(true)
  })
})
