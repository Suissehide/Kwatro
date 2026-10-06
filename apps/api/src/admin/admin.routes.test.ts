import { type CallHandler, type ExecutionContext, RequestMethod } from '@nestjs/common'
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants'
import { Reflector } from '@nestjs/core'
import { lastValueFrom, of } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { AppModule } from '../app.module'
import { ROLES } from '../auth/auth.decorators'
import { AuthService } from '../auth/auth.service'
import type { User } from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'
import { AUDIT, AuditInterceptor } from './admin.decorators'

type Class = new (...args: never[]) => unknown

/** Toutes les routes de l'API : contrôleurs de chaque module importé par AppModule. */
function routes() {
  const modules: Class[] = Reflect.getMetadata('imports', AppModule)
  return modules.flatMap((module) =>
    ((Reflect.getMetadata('controllers', module) ?? []) as Class[]).flatMap((controller) => {
      const prefix = String(Reflect.getMetadata(PATH_METADATA, controller) ?? '')
      const proto = controller.prototype as Record<string, unknown>
      return Object.getOwnPropertyNames(proto)
        .filter((name) => name !== 'constructor')
        .map((name) => proto[name])
        .filter(
          (handler): handler is object =>
            typeof handler === 'function' && Reflect.hasMetadata(PATH_METADATA, handler),
        )
        .map((handler) => ({
          path: [prefix, Reflect.getMetadata(PATH_METADATA, handler)].filter(Boolean).join('/'),
          method: Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod,
          handler,
        }))
    }),
  )
}

describe('routes /admin/*', () => {
  const admin = routes().filter((r) => r.path.startsWith('admin'))

  it('existent', () => {
    expect(admin.length).toBeGreaterThan(10)
  })

  it('sont toutes réservées au rôle ADMIN (403 pour les autres)', () => {
    const open = admin.filter((r) => !Reflect.getMetadata(ROLES, r.handler)?.includes('ADMIN'))
    expect(open.map((r) => r.path)).toEqual([])
  })

  it("tracent toutes les actions dans le journal d'audit", () => {
    const untraced = admin.filter(
      (r) => r.method !== RequestMethod.GET && !Reflect.getMetadata(AUDIT, r.handler),
    )
    expect(untraced.map((r) => r.path)).toEqual([])
  })
})

describe('AuditInterceptor', () => {
  it("écrit l'admin, l'action, la cible et le motif une fois la route réussie", async () => {
    const create = vi.fn()
    const prisma = { adminAction: { create } } as unknown as PrismaService
    const request = {
      user: { id: 'admin-1' },
      params: { id: 'report-1' },
      body: { resolution: 'WARNED', reason: 'Insultes en room' },
    }
    const context = {
      getHandler: () => handler,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext
    const handler = () => {}
    Reflect.defineMetadata(AUDIT, () => 'REPORT_WARN', handler)
    const next: CallHandler = { handle: () => of(undefined) }

    await lastValueFrom(new AuditInterceptor(new Reflector(), prisma).intercept(context, next))
    expect(create).toHaveBeenCalledWith({
      data: {
        adminId: 'admin-1',
        action: 'REPORT_WARN',
        targetId: 'report-1',
        reason: 'Insultes en room',
        data: request.body,
      },
    })
  })
})

describe('suspension', () => {
  it('un compte suspendu compte comme déconnecté, même avec une session encore valide', async () => {
    const suspended = {
      id: 'u1',
      suspendedAt: new Date(),
      suspendedUntil: null,
    } as unknown as User
    const service = Object.assign(Object.create(AuthService.prototype), {
      devHeader: false,
      auth: { api: { getSession: async () => ({ user: { id: 'u1' } }) } },
      prisma: { user: { findFirst: async () => suspended } },
    }) as AuthService
    await expect(service.resolveUser({ headers: {} } as never)).resolves.toBeNull()
  })
})
