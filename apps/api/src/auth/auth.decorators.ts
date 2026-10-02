import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common'
import type { UserRole } from '../generated/prisma/client'
import type { AuthRequest } from './auth.service'

export const IS_PUBLIC = 'isPublic'
export const ROLES = 'roles'

/** Route accessible sans connexion. Par défaut, toutes les routes exigent un utilisateur connecté. */
export const Public = () => SetMetadata(IS_PUBLIC, true)

/** Route réservée à certains rôles globaux (ex. `@Roles('ADMIN')`). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES, roles)

/** Utilisateur connecté, posé sur la requête par AuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AuthRequest>().user,
)
