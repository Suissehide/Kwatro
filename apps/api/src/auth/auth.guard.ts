import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { UserRole } from '../generated/prisma/client'
import { IS_PUBLIC, ROLES } from './auth.decorators'
import { type AuthRequest, AuthService } from './auth.service'

/**
 * Guard global : toute route exige un utilisateur connecté, sauf `@Public()`,
 * et `@Roles(...)` restreint aux rôles listés. Les règles métier plus fines
 * (mineurs, staff d'un lieu, hôte d'une room) s'ajoutent en guards dédiés.
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
    return true
  }
}
