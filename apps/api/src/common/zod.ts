import {
  applyDecorators,
  BadRequestException,
  Body,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
  type PipeTransform,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiResponse, type SchemaObject } from '@nestjs/swagger'
import { map } from 'rxjs'
import { z } from 'zod'
/** Schéma Zod → JSON Schema OpenAPI 3.0 (`input` pour ce que reçoit l'API, `output` pour ce qu'elle renvoie). */
export function toOpenApi(schema: z.ZodType, io: 'input' | 'output'): SchemaObject {
  return z.toJSONSchema(schema, { target: 'openapi-3.0', io }) as SchemaObject
}

/** Valide une entrée avec un schéma partagé (@kwatro/shared) ; 400 avec la liste des champs en erreur. */
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

class ZodSerializerInterceptor implements NestInterceptor {
  constructor(private readonly schema: z.ZodType) {}

  intercept(_context: ExecutionContext, next: CallHandler) {
    // Les clés absentes du schéma sont retirées : rien ne fuit par erreur (date de naissance, adresse…).
    return next.handle().pipe(map((data) => this.schema.parse(data)))
  }
}

/** Réponse filtrée par `schema` et documentée dans OpenAPI (le client typé de l'app en découle). */
export function ZodResponse(schema: z.ZodType, status = 200) {
  return applyDecorators(
    ApiResponse({ status, schema: toOpenApi(schema, 'output') }),
    UseInterceptors(new ZodSerializerInterceptor(schema)),
  )
}
