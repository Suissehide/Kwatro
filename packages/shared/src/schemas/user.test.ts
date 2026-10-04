import { describe, expect, it } from 'vitest'
import { birthDateSchema, passwordSchema } from './user'

describe('passwordSchema', () => {
  it('exige au moins 8 caractères', () => {
    expect(passwordSchema.safeParse('1234567').success).toBe(false)
    expect(passwordSchema.safeParse('12345678').success).toBe(true)
  })
})

describe('birthDateSchema', () => {
  it('accepte AAAA-MM-JJ, refuse les dates impossibles ou futures', () => {
    expect(birthDateSchema.parse('2004-07-14')).toEqual(new Date(Date.UTC(2004, 6, 14)))
    expect(birthDateSchema.safeParse('2004-02-31').success).toBe(false)
    expect(birthDateSchema.safeParse('14/07/2004').success).toBe(false)
    expect(birthDateSchema.safeParse(`${new Date().getFullYear() + 1}-01-01`).success).toBe(false)
  })
})
