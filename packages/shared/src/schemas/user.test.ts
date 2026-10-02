import { describe, expect, it } from 'vitest'
import { passwordSchema } from './user'

describe('passwordSchema', () => {
  it('exige au moins 8 caractères', () => {
    expect(passwordSchema.safeParse('1234567').success).toBe(false)
    expect(passwordSchema.safeParse('12345678').success).toBe(true)
  })
})
