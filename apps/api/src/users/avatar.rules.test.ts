import { describe, expect, it } from 'vitest'
import { avatarVerdict, type ImageScores, imageType } from './avatar.rules'

const clean: ImageScores = {
  nudity: { sexual_activity: 0.01, sexual_display: 0.01, erotica: 0.01, very_suggestive: 0.01 },
  gore: { prob: 0.01 },
  offensive: {
    nazi: 0.01,
    asian_swastika: 0.01,
    supremacist: 0.01,
    terrorist: 0.01,
    confederate: 0.01,
    middle_finger: 0.01,
  },
}

describe('avatarVerdict', () => {
  it('valide une photo sans risque', () => {
    expect(avatarVerdict(clean)).toBe('APPROVED')
  })

  it('refuse le contenu explicite, sanglant ou haineux', () => {
    expect(avatarVerdict({ ...clean, nudity: { ...clean.nudity, sexual_display: 0.95 } })).toBe(
      'REJECTED',
    )
    expect(avatarVerdict({ ...clean, gore: { prob: 0.9 } })).toBe('REJECTED')
    expect(avatarVerdict({ ...clean, offensive: { ...clean.offensive, nazi: 0.85 } })).toBe(
      'REJECTED',
    )
  })

  it("garde pour un admin les cas douteux et l'analyse indisponible", () => {
    expect(avatarVerdict({ ...clean, nudity: { ...clean.nudity, erotica: 0.5 } })).toBe('PENDING')
    expect(avatarVerdict({ ...clean, nudity: { ...clean.nudity, very_suggestive: 0.9 } })).toBe(
      'PENDING',
    )
    expect(avatarVerdict({ ...clean, offensive: { ...clean.offensive, middle_finger: 0.9 } })).toBe(
      'PENDING',
    )
    expect(avatarVerdict(null)).toBe('PENDING')
  })
})

describe('imageType', () => {
  const bytes = (...parts: (number[] | string)[]) =>
    new Uint8Array(
      parts.flatMap((p) => (typeof p === 'string' ? [...p].map((c) => c.charCodeAt(0)) : p)),
    )

  it('reconnaît JPEG, PNG et WebP à leur signature', () => {
    expect(imageType(bytes([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe('image/jpeg')
    expect(imageType(bytes([0x89], 'PNG', [0x0d, 0x0a]))?.mime).toBe('image/png')
    expect(imageType(bytes('RIFF', [0, 0, 0, 0], 'WEBPVP8 '))?.mime).toBe('image/webp')
  })

  it('refuse le reste, même annoncé comme image', () => {
    expect(imageType(bytes('<html><script>'))).toBeNull()
    expect(imageType(bytes('GIF89a'))).toBeNull()
    expect(imageType(new Uint8Array())).toBeNull()
  })
})
