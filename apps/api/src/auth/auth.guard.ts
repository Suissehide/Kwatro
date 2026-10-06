import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { UserRole, VenueStaffRole } from '../generated/prisma/client'
import { IS_PUBLIC, ROLES, VENUE_ROLES } from './auth.decorators'
import { type AuthRequest, AuthService } from './auth.service'

/**
 * Guard global : toute route exige un utilisateur connecté, sauf `@Public()`,
 * `@Roles(...)` restreint aux rôles globaux listés, `@VenueRoles(...)` au staff du lieu `:venueId`.
 * Les règles qui dépendent de la ressource (mineurs, hôte d'une room) restent dans les services.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()]
    const request = context.switchToHttp().getRequest<AuthRequest>()
    const user = await this.auth.resolveUser(request)
    // Route publique : l'utilisateur est quand même posé s'il est connecté (ex. « inscrit » sur une fiche)
    if (user) request.user = user
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) return true
    if (!user) throw new UnauthorizedException('Connexion requise')

    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES, targets)
    if (roles?.length && !roles.includes(user.role)) throw new ForbiddenException('Accès refusé')

    const venueRoles = this.reflector.getAllAndOverride<VenueStaffRole[] | undefined>(
      VENUE_ROLES,
      targets,
    )
    if (venueRoles?.length && user.role !== 'ADMIN') {
      const venueId = request.params?.venueId
      if (typeof venueId !== 'string')
        throw new Error('@VenueRoles exige un paramètre :venueId dans la route')
      const role = await this.auth.venueRole(user.id, venueId)
      if (!role || !venueRoles.includes(role))
        throw new ForbiddenException('Réservé au staff du lieu')
    }
    return true
  }
}
