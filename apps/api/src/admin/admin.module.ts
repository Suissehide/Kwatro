import { Module } from '@nestjs/common'
import { AuditInterceptor } from './admin.decorators'
import { AdminService } from './admin.service'
import { AdminCatalogController } from './admin-catalog.controller'
import { AdminModerationController } from './admin-moderation.controller'

/** Back-office de l'équipe Lucko (LKO-20) : routes /admin/*, réservées au rôle ADMIN. */
@Module({
  controllers: [AdminModerationController, AdminCatalogController],
  providers: [AdminService, AuditInterceptor],
})
export class AdminModule {}
