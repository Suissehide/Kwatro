import { describe, expect, it } from 'vitest'
import { hasBannedWord } from './moderation'

describe('hasBannedWord', () => {
  it('trouve les insultes déguisées (majuscules, accents, leet, séparateurs)', () => {
    expect(hasBannedWord('xXConnardXx')).toBe(true)
    expect(hasBannedWord('Enculé_33')).toBe(true)
    expect(hasBannedWord('s4l0p3')).toBe(true)
    expect(hasBannedWord('le.pd')).toBe(true)
    expect(hasBannedWord('fdp-du-33')).toBe(true)
  })

  it('laisse passer les mots qui en contiennent un court', () => {
    for (const ok of ['Technique', 'dispute', 'Violette', 'habitue', 'Léa_33', 'Unique', 'speedy'])
      expect(hasBannedWord(ok), ok).toBe(false)
  })
})
