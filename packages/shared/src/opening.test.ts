import { describe, expect, it } from 'vitest'
import {
  addMonths,
  type ClosureRange,
  localDateTime,
  monthGrid,
  openingStatus,
  rangesOn,
} from './opening'

// Bar : mardi → samedi 17 h - 1 h ; boutique : dimanche 14 h - 20 h
const bar = [2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  opensAtMinute: 17 * 60,
  closesAtMinute: 60,
}))
const sunday = [{ weekday: 7, opensAtMinute: 14 * 60, closesAtMinute: 20 * 60 }]

describe('localDateTime', () => {
  it("donne la date, le jour et l'heure de Paris, pas ceux du serveur", () => {
    // mardi 6 octobre 2026, 23 h 30 UTC = mercredi 7 à 1 h 30 à Paris
    expect(localDateTime(new Date('2026-10-06T23:30:00Z'))).toEqual({
      date: '2026-10-07',
      weekday: 3,
      minute: 90,
    })
  })
})

describe('openingStatus', () => {
  it('ouvert le soir, avec fermeture après minuit', () => {
    // mardi 6 octobre 2026, 21 h à Paris
    expect(openingStatus(bar, [], new Date('2026-10-06T19:00:00Z'))).toEqual({
      openNow: true,
      closesAtMinute: 60,
      nextOpening: null,
    })
  })

  it('toujours ouvert après minuit grâce à la plage de la veille', () => {
    // mercredi 0 h 30 à Paris (plage du mardi)
    expect(openingStatus(bar, [], new Date('2026-10-06T22:30:00Z')).openNow).toBe(true)
  })

  it('fermé après la fermeture et le lundi, avec la prochaine ouverture', () => {
    // mercredi 2 h à Paris : rouvre le jour même à 17 h
    expect(openingStatus(bar, [], new Date('2026-10-07T00:00:00Z'))).toEqual({
      openNow: false,
      closesAtMinute: null,
      nextOpening: { date: '2026-10-07', minute: 17 * 60 },
    })
    // lundi 21 h à Paris (dimanche soir ne déborde pas) : rouvre mardi
    expect(openingStatus(bar, [], new Date('2026-10-05T19:00:00Z')).nextOpening).toEqual({
      date: '2026-10-06',
      minute: 17 * 60,
    })
  })

  it('plage simple et horaires absents', () => {
    expect(openingStatus(sunday, [], new Date('2026-10-04T13:00:00Z')).openNow).toBe(true) // dim. 15 h
    expect(openingStatus(sunday, [], new Date('2026-10-04T19:00:00Z')).openNow).toBe(false) // dim. 21 h
    expect(openingStatus([], [], new Date())).toEqual({
      openNow: null,
      closesAtMinute: null,
      nextOpening: null,
    })
  })

  it('une fermeture exceptionnelle ferme le lieu et repousse la prochaine ouverture', () => {
    const holidays: ClosureRange[] = [
      {
        startsOn: '2026-10-06',
        endsOn: '2026-10-07',
        kind: 'CLOSED',
        opensAtMinute: null,
        closesAtMinute: null,
      },
    ]
    // mardi 21 h, normalement ouvert
    expect(openingStatus(bar, holidays, new Date('2026-10-06T19:00:00Z'))).toEqual({
      openNow: false,
      closesAtMinute: null,
      nextOpening: { date: '2026-10-08', minute: 17 * 60 },
    })
  })

  it('des horaires modifiés remplacent ceux de la semaine', () => {
    const special: ClosureRange[] = [
      {
        startsOn: '2026-11-11',
        endsOn: '2026-11-11',
        kind: 'SPECIAL_HOURS',
        opensAtMinute: 14 * 60,
        closesAtMinute: 2 * 60,
      },
    ]
    expect(rangesOn('2026-11-11', bar, special)).toEqual([
      { opensAtMinute: 14 * 60, closesAtMinute: 2 * 60 },
    ])
    // mercredi 11 novembre, 15 h à Paris (heure d'hiver)
    expect(openingStatus(bar, special, new Date('2026-11-11T14:00:00Z')).openNow).toBe(true)
  })
})

describe('monthGrid', () => {
  it('commence un lundi et complète la dernière semaine', () => {
    // 1er octobre 2026 : un jeudi
    const october = monthGrid('2026-10')
    expect(october).toHaveLength(35)
    expect(october.slice(0, 4)).toEqual([null, null, null, '2026-10-01'])
    expect(october[33]).toBe('2026-10-31')
    expect(october[34]).toBeNull()
    expect(addMonths('2026-11', 2)).toBe('2027-01')
  })
})
