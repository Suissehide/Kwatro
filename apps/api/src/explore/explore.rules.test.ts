import { describe, expect, it } from 'vitest'
import { compareByDistance, localWeekdayMinute, openingStatus } from './explore.rules'

// Bar : mardi → samedi 17 h - 1 h ; boutique : dimanche 14 h - 20 h
const bar = [2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  opensAtMinute: 17 * 60,
  closesAtMinute: 60,
}))
const sunday = [{ weekday: 7, opensAtMinute: 14 * 60, closesAtMinute: 20 * 60 }]

describe('localWeekdayMinute', () => {
  it("donne le jour et l'heure de Paris, pas ceux du serveur", () => {
    // mardi 6 octobre 2026, 23 h 30 UTC = mercredi 1 h 30 à Paris
    expect(localWeekdayMinute(new Date('2026-10-06T23:30:00Z'))).toEqual({ weekday: 3, minute: 90 })
  })
})

describe('openingStatus', () => {
  it('ouvert le soir, avec fermeture après minuit', () => {
    // mardi 6 octobre 2026, 21 h à Paris
    expect(openingStatus(bar, new Date('2026-10-06T19:00:00Z'))).toEqual({
      openNow: true,
      closesAtMinute: 60,
    })
  })

  it('toujours ouvert après minuit grâce à la plage de la veille', () => {
    // mercredi 0 h 30 à Paris (plage du mardi)
    expect(openingStatus(bar, new Date('2026-10-06T22:30:00Z')).openNow).toBe(true)
  })

  it('fermé après la fermeture et le lundi', () => {
    // mercredi 2 h à Paris
    expect(openingStatus(bar, new Date('2026-10-07T00:00:00Z')).openNow).toBe(false)
    // lundi 21 h à Paris (dimanche soir ne déborde pas)
    expect(openingStatus(bar, new Date('2026-10-05T19:00:00Z')).openNow).toBe(false)
  })

  it('plage simple et horaires absents', () => {
    expect(openingStatus(sunday, new Date('2026-10-04T13:00:00Z')).openNow).toBe(true) // dim. 15 h
    expect(openingStatus(sunday, new Date('2026-10-04T19:00:00Z')).openNow).toBe(false) // dim. 21 h
    expect(openingStatus([], new Date())).toEqual({ openNow: null, closesAtMinute: null })
  })
})

describe('compareByDistance (tri honnête)', () => {
  const sort = (items: { id: string; distanceMeters: number; isPartner: boolean }[]) =>
    [...items].sort(compareByDistance).map((v) => v.id)

  it('à distance égale (même tranche de 250 m), le partenaire passe devant', () => {
    expect(
      sort([
        { id: 'boutique', distanceMeters: 710, isPartner: false },
        { id: 'partenaire', distanceMeters: 740, isPartner: true },
      ]),
    ).toEqual(['partenaire', 'boutique'])
  })

  it('un partenaire nettement plus loin ne passe jamais devant', () => {
    expect(
      sort([
        { id: 'partenaire', distanceMeters: 1200, isPartner: true },
        { id: 'proche', distanceMeters: 300, isPartner: false },
      ]),
    ).toEqual(['proche', 'partenaire'])
  })
})
