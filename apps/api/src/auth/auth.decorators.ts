import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common'
import type { UserRole, VenueStaffRole } from '../generated/prisma/client'
import type { AuthRequest } from './auth.service'

export const IS_PUBLIC = 'isPublic'
export const ROLES = 'roles'
export const VENUE_ROLES = 'venueRoles'

/** Route accessible sans connexion. Par défaut, toutes les routes exigent un utilisateur connecté. */
export const Public = () => SetMetadata(IS_PUBLIC, true)

/** Route réservée à certains rôles globaux (ex. `@Roles('ADMIN')`). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES, roles)

/**
 * Route réservée au staff du lieu `:venueId` de l'URL, avec l'un des rôles listés
 * (ex. `@VenueRoles('MANAGER')` pour la facture, `@VenueRoles('MANAGER', 'STAFF')` pour scanner).
 * Les rôles sont par lieu (VenueStaff) : un joueur peut être staff d'un lieu et pas d'un autre.
 * Les admins passent toujours.
 */
export const VenueRoles = (...roles: VenueStaffRole[]) => SetMetadata(VENUE_ROLES, roles)

/** Utilisateur connecté, posé sur la requête par AuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AuthRequest>().user,
)
