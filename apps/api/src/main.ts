import 'reflect-metadata'
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { loadEnv } from './config/env'

async function bootstrap() {
  const env = loadEnv()
  const app = await NestFactory.create(AppModule)
  app.enableCors({ origin: env.CORS_ORIGINS, credentials: true })
  app.enableShutdownHooks()
  await app.listen(env.API_PORT)
  Logger.log(`API Kwatro sur http://localhost:${env.API_PORT}`, 'Bootstrap')
}

void bootstrap()
