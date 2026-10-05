import { describe, expect, it } from 'vitest'
import { eventVisibleTo, isMinor, roomVisibleTo } from './minors.rules'

const now = new Date('2026-10-05T12:00:00Z')
const adult = { id: 'adult', birthDate: new Date('1990-05-01'), parentId: null }
const minor = { id: 'minor', birthDate: new Date('2010-05-01'), parentId: 'parent' }
const noBirthDate = { id: 'new', birthDate: null, parentId: null }
const room = { minorsAllowed: false, atHome: false, hostId: 'host' }

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
    const home = { minorsAllowed: true, atHome: true, hostId: 'host' }
    expect(roomVisibleTo(home, minor, now)).toBe(false)
    expect(roomVisibleTo(home, noBirthDate, now)).toBe(false)
    expect(roomVisibleTo({ ...home, hostId: 'parent' }, minor, now)).toBe(true)
    expect(roomVisibleTo(home, adult, now)).toBe(true)
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
