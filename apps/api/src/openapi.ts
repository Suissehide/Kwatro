import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

/** Document OpenAPI de l'API : servi sur /docs en dev, et source du client typé (@kwatro/api-client). */
export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API Kwatro')
    .setVersion('0.1.0')
    // ponytail: en-tête de dev en attendant la session Better Auth (KWT-9)
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-dev-user-id' }, 'dev-user')
    .addSecurityRequirements('dev-user')
    .build()
  return SwaggerModule.createDocument(app, config)
}
