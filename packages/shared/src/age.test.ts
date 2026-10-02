import { describe, expect, it } from 'vitest'
import { ageOn, ageRegime, parseBirthDate } from './age'

const today = new Date(2026, 9, 2) // 2 octobre 2026

describe('parseBirthDate', () => {
  it('accepte une date réelle et refuse une date impossible', () => {
    expect(parseBirthDate('29', '02', '2008')?.toISOString()).toBe('2008-02-29T00:00:00.000Z')
    expect(parseBirthDate('31', '02', '2008')).toBeNull()
    expect(parseBirthDate('12', '', '2008')).toBeNull()
    expect(parseBirthDate('1', '1', '1850')).toBeNull()
  })
})

describe('ageOn', () => {
  it("ne compte l'année qu'une fois l'anniversaire passé", () => {
    expect(ageOn(new Date(Date.UTC(2013, 9, 2)), today)).toBe(13)
    expect(ageOn(new Date(Date.UTC(2013, 9, 3)), today)).toBe(12)
  })
})

describe('ageRegime', () => {
  it('applique les seuils 13 / 15 / 18 ans', () => {
    expect(ageRegime(new Date(Date.UTC(2013, 9, 3)), today)).toBe('too-young')
    expect(ageRegime(new Date(Date.UTC(2013, 9, 2)), today)).toBe('parental-consent')
    expect(ageRegime(new Date(Date.UTC(2011, 9, 2)), today)).toBe('minor')
    expect(ageRegime(new Date(Date.UTC(2008, 9, 2)), today)).toBe('adult')
  })
})
