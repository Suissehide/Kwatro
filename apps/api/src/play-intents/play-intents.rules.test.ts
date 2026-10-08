import { describe, expect, it } from 'vitest'
import { matchesWhen, shouldNotify, visibleCount } from './play-intents.rules'

const now = new Date('2026-10-08T10:00:00Z')
const bordeaux = { latitude: 44.8378, longitude: -0.5792 }
const intent = { expiresAt: new Date('2026-10-15T10:00:00Z'), notifiedAt: null }
const adult = {
  id: 'joueur',
  birthDate: new Date('1995-01-01'),
  parentId: null,
  searchRadiusKm: 10,
  playWhen: 'ANY' as const,
  ...bordeaux,
}
// Samedi 10 octobre, 19 h 30 à Paris
const room = {
  hostId: 'hote',
  atHome: false,
  minorsAllowed: false,
  startsAt: new Date('2026-10-10T17:30:00Z'),
  venue: { latitude: 44.8412, longitude: -0.5701, acceptsUnaccompaniedMinors: true },
}

describe('visibleCount', () => {
  it('masque les petits nombres (anonymat)', () => {
    expect(visibleCount(2)).toBeNull()
    expect(visibleCount(3)).toBe(3)
  })
})

describe('matchesWhen', () => {
  it("soir à partir de 17 h, week-end samedi et dimanche, à l'heure de Paris", () => {
    expect(matchesWhen('EVENING', new Date('2026-10-08T15:00:00Z'))).toBe(true)
    expect(matchesWhen('EVENING', new Date('2026-10-08T14:59:00Z'))).toBe(false)
    expect(matchesWhen('WEEKEND', room.startsAt)).toBe(true)
    expect(matchesWhen('WEEKEND', new Date('2026-10-09T18:00:00Z'))).toBe(false)
    expect(matchesWhen('ANY', new Date('2026-10-09T08:00:00Z'))).toBe(true)
  })
})

describe('shouldNotify', () => {
  it("prévient un joueur proche dont l'envie est active", () => {
    expect(shouldNotify(intent, adult, room, now)).toBe(true)
  })

  it("jamais l'hôte, une room à domicile ou une envie expirée", () => {
    expect(shouldNotify(intent, { ...adult, id: 'hote' }, room, now)).toBe(false)
    expect(shouldNotify(intent, adult, { ...room, atHome: true }, now)).toBe(false)
    expect(shouldNotify({ ...intent, expiresAt: now }, adult, room, now)).toBe(false)
  })

  it('une notification par jeu toutes les 12 h', () => {
    const recent = { ...intent, notifiedAt: new Date('2026-10-08T00:00:00Z') }
    const old = { ...intent, notifiedAt: new Date('2026-10-07T22:00:00Z') }
    expect(shouldNotify(recent, adult, room, now)).toBe(false)
    expect(shouldNotify(old, adult, room, now)).toBe(true)
  })

  it('hors du rayon ou sans ville : rien', () => {
    // Mérignac, à environ 8 km
    const far = {
      ...room,
      venue: { latitude: 44.8333, longitude: -0.6833, acceptsUnaccompaniedMinors: true },
    }
    expect(shouldNotify(intent, { ...adult, searchRadiusKm: 5 }, far, now)).toBe(false)
    expect(shouldNotify(intent, { ...adult, latitude: null }, room, now)).toBe(false)
  })

  it('respecte le moment choisi', () => {
    expect(shouldNotify(intent, { ...adult, playWhen: 'WEEKEND' }, room, now)).toBe(true)
    const tuesdayNoon = { ...room, startsAt: new Date('2026-10-13T10:00:00Z') }
    expect(shouldNotify(intent, { ...adult, playWhen: 'EVENING' }, tuesdayNoon, now)).toBe(false)
  })

  it("un mineur n'est prévenu que des rooms ouvertes aux mineurs", () => {
    const minor = { ...adult, birthDate: new Date('2011-01-01') }
    expect(shouldNotify(intent, minor, room, now)).toBe(false)
    expect(shouldNotify(intent, minor, { ...room, minorsAllowed: true }, now)).toBe(true)
  })
})
