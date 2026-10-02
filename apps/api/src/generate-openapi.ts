import 'reflect-metadata'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { createOpenApiDocument } from './openapi'

/** Écrit packages/api-client/openapi.json sans démarrer l'API (mode preview : ni base, ni port). */
async function generate() {
  const app = await NestFactory.create(AppModule, { preview: true, logger: false })
  const output = join(__dirname, '../../../packages/api-client/openapi.json')
  writeFileSync(output, `${JSON.stringify(createOpenApiDocument(app), null, 2)}\n`)
  await app.close()
  console.log(`OpenAPI écrit dans ${output}`)
}

void generate()
