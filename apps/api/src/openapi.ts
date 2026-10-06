import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

/** Document OpenAPI de l'API : servi sur /docs en dev, et source du client typé (@lucko/api-client). */
export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API Lucko')
    .setVersion('0.1.0')
    // Joueurs de démo dans /docs ; la session Better Auth (cookie) passe aussi si on est connecté sur localhost
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-dev-user-id' }, 'dev-user')
    .addSecurityRequirements('dev-user')
    .build()
  return SwaggerModule.createDocument(app, config)
}
