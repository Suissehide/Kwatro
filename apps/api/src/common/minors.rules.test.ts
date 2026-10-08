import { describe, expect, it } from 'vitest'
import { eventVisibleTo, isMinor, roomVisibleTo, venueRefuses } from './minors.rules'

const now = new Date('2026-10-05T12:00:00Z')
const adult = { id: 'adult', birthDate: new Date('1990-05-01'), parentId: null }
const minor = { id: 'minor', birthDate: new Date('2010-05-01'), parentId: 'parent' }
const noBirthDate = { id: 'new', birthDate: null, parentId: null }
const young = { id: 'young', birthDate: new Date('2012-05-01'), parentId: 'parent' }
const shop = { acceptsUnaccompaniedMinors: true }
const bar = { acceptsUnaccompaniedMinors: false }
const room = { minorsAllowed: false, atHome: false, hostId: 'host', venue: shop }

describe('isMinor', () => {
  it('mineur sous 18 ans, ou sans date de naissance ; visiteur anonyme non', () => {
    expect(isMinor(adult, now)).toBe(false)
    expect(isMinor(minor, now)).toBe(true)
    expect(isMinor(noBirthDate, now)).toBe(true)
    expect(isMinor(null, now)).toBe(false)
  })
})

describe('roomVisibleTo', () => {
  it('un mineur ne voit que les rooms ouvertes aux mineurs', () => {
    expect(roomVisibleTo(room, adult, now)).toBe(true)
    expect(roomVisibleTo(room, minor, now)).toBe(false)
    expect(roomVisibleTo({ ...room, minorsAllowed: true }, minor, now)).toBe(true)
  })

  it('pas de room à domicile pour un mineur, sauf celle de son parent lié', () => {
    const home = { minorsAllowed: true, atHome: true, hostId: 'host', venue: null }
    expect(roomVisibleTo(home, minor, now)).toBe(false)
    expect(roomVisibleTo(home, noBirthDate, now)).toBe(false)
    expect(roomVisibleTo({ ...home, hostId: 'parent' }, minor, now)).toBe(true)
    expect(roomVisibleTo(home, adult, now)).toBe(true)
  })
})

describe('lieux et moins de 16 ans (LKO-51)', () => {
  const inBar = { ...room, minorsAllowed: true, venue: bar }

  it('matrice âge × lieu', () => {
    // adulte, 16-17 ans, 13-15 ans, sans date de naissance (13 ans retenus)
    expect([adult, minor, young, noBirthDate].map((v) => roomVisibleTo(inBar, v, now))).toEqual([
      true,
      true,
      false,
      false,
    ])
    const inShop = { ...inBar, venue: shop }
    expect([adult, minor, young, noBirthDate].map((v) => roomVisibleTo(inShop, v, now))).toEqual([
      true,
      true,
      true,
      true,
    ])
  })

  it('un moins de 16 ans rejoint la room de son parent lié, même dans un bar', () => {
    expect(roomVisibleTo({ ...inBar, hostId: 'parent' }, young, now)).toBe(true)
    expect(roomVisibleTo({ ...inBar, hostId: 'parent', minorsAllowed: false }, young, now)).toBe(
      false,
    )
  })

  it('venueRefuses : seulement sous 16 ans, dans un lieu qui refuse les mineurs seuls', () => {
    expect(venueRefuses(bar, young, now)).toBe(true)
    expect(venueRefuses(bar, minor, now)).toBe(false)
    expect(venueRefuses(shop, young, now)).toBe(false)
    expect(venueRefuses(null, young, now)).toBe(false)
    expect(venueRefuses(bar, null, now)).toBe(false)
  })
})

describe('eventVisibleTo', () => {
  it('cache les événements dont le joueur n’a pas l’âge minimum', () => {
    const adultsOnly = { minAge: 18 }
    expect(eventVisibleTo(adultsOnly, adult, now)).toBe(true)
    expect(eventVisibleTo(adultsOnly, minor, now)).toBe(false)
    expect(eventVisibleTo(adultsOnly, noBirthDate, now)).toBe(false)
    expect(eventVisibleTo({ minAge: 13 }, noBirthDate, now)).toBe(true)
    expect(eventVisibleTo({ minAge: null }, minor, now)).toBe(true)
    expect(eventVisibleTo(adultsOnly, null, now)).toBe(true)
  })
})
