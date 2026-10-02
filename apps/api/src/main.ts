import 'reflect-metadata'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { loadEnv } from './config/env'
import { createOpenApiDocument } from './openapi'

async function bootstrap() {
  const env = loadEnv()
  const app = await NestFactory.create(AppModule)
  app.enableCors({ origin: env.CORS_ORIGINS, credentials: true })
  app.enableShutdownHooks()
  if (env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, createOpenApiDocument(app), {
      jsonDocumentUrl: 'openapi.json',
    })
  }
  await app.listen(env.API_PORT)
  Logger.log(`API Kwatro sur http://localhost:${env.API_PORT} (docs : /docs)`, 'Bootstrap')
}

void bootstrap()
