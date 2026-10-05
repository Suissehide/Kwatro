import { describe, expect, it } from 'vitest'
import { birthDateSchema, passwordSchema, pseudoSchema, updateProfileSchema } from './user'

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

describe('pseudoSchema', () => {
  it('3 à 20 caractères, lettres accentuées et chiffres, sans espace', () => {
    expect(pseudoSchema.parse('  Léa_33 ')).toBe('Léa_33')
    expect(pseudoSchema.safeParse('Lé').success).toBe(false)
    expect(pseudoSchema.safeParse('a'.repeat(21)).success).toBe(false)
    expect(pseudoSchema.safeParse('Léa B').success).toBe(false)
  })

  it('refuse les mots interdits', () => {
    expect(pseudoSchema.safeParse('xXconnardXx').success).toBe(false)
  })
})

describe('updateProfileSchema', () => {
  it('dédoublonne les créneaux et les ambiances, borne le rayon', () => {
    expect(
      updateProfileSchema.parse({ availability: [5, 2, 5], vibes: ['CHILL', 'CHILL'] }),
    ).toEqual({ availability: [2, 5], vibes: ['CHILL'] })
    expect(updateProfileSchema.safeParse({ availability: [21] }).success).toBe(false)
    expect(updateProfileSchema.safeParse({ searchRadiusKm: 51 }).success).toBe(false)
  })

  it('latitude et longitude ensemble', () => {
    expect(updateProfileSchema.safeParse({ latitude: 44.8 }).success).toBe(false)
    expect(updateProfileSchema.safeParse({ latitude: 44.8, longitude: -0.5 }).success).toBe(true)
    expect(updateProfileSchema.safeParse({ latitude: null, longitude: null }).success).toBe(true)
  })
})
