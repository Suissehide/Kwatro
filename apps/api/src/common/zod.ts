import {
  applyDecorators,
  BadRequestException,
  Body,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
  type PipeTransform,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiQuery, ApiResponse, type SchemaObject } from '@nestjs/swagger'
import { map } from 'rxjs'
import { z } from 'zod'

/**
 * Schéma Zod → JSON Schema OpenAPI 3.0. `input` = la forme JSON qui circule (requêtes, et réponses
 * encodées : une date `isoDateTime` y est une chaîne) ; `output` = la forme après validation.
 */
export function toOpenApi(schema: z.ZodType, io: 'input' | 'output'): SchemaObject {
  return z.toJSONSchema(schema, { target: 'openapi-3.0', io }) as SchemaObject
}

/** Valide une entrée avec un schéma partagé (@lucko/shared) ; 400 avec la liste des champs en erreur. */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException({
        message: 'Données invalides',
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      })
    }
    return result.data
  }
}

/** Corps de requête validé par `schema` et documenté dans OpenAPI : `create(@ZodBody(createRoomSchema) body: CreateRoomInput)`. */
export function ZodBody(schema: z.ZodType): ParameterDecorator {
  return (target, key, index) => {
    Body(new ZodValidationPipe(schema))(target, key, index)
    if (key === undefined) return
    const descriptor = Object.getOwnPropertyDescriptor(target, key)
    if (descriptor) ApiBody({ schema: toOpenApi(schema, 'input') })(target, key, descriptor)
  }
}

/** Paramètres d'URL validés par `schema` (nombres convertis, défauts appliqués) et documentés un par un. */
export function ZodQuery(schema: z.ZodObject): ParameterDecorator {
  return (target, key, index) => {
    Query(new ZodValidationPipe(schema))(target, key, index)
    if (key === undefined) return
    const descriptor = Object.getOwnPropertyDescriptor(target, key)
    if (!descriptor) return
    const json = toOpenApi(schema, 'input')
    for (const [name, property] of Object.entries(json.properties ?? {})) {
      const required = json.required?.includes(name) ?? false
      ApiQuery({ name, required, schema: property as SchemaObject })(target, key, descriptor)
    }
  }
}

class ZodSerializerInterceptor implements NestInterceptor {
  constructor(private readonly schema: z.ZodType) {}

  intercept(_context: ExecutionContext, next: CallHandler) {
    // Encodage (dates → ISO) + clés absentes du schéma retirées : rien ne fuit par erreur.
    return next.handle().pipe(map((data) => z.encode(this.schema, data)))
  }
}

/** Réponse filtrée par `schema` et documentée dans OpenAPI (le client typé de l'app en découle). */
export function ZodResponse(schema: z.ZodType, status = 200) {
  return applyDecorators(
    ApiResponse({ status, schema: toOpenApi(schema, 'input') }),
    UseInterceptors(new ZodSerializerInterceptor(schema)),
  )
}
