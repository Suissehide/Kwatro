import { describe, expect, it } from 'vitest'
import {
  eventOccurrences,
  isSuspended,
  planFormatMerge,
  planProfileMerge,
  suspensionEnd,
} from './admin.rules'

const now = new Date('2026-10-06T12:00:00Z')

describe('isSuspended', () => {
  it('suspension définitive, temporaire en cours, échue ou absente', () => {
    expect(isSuspended({ suspendedAt: now, suspendedUntil: null }, now)).toBe(true)
    expect(isSuspended({ suspendedAt: now, suspendedUntil: suspensionEnd(7, now) }, now)).toBe(true)
    const later = new Date('2026-10-14T12:00:00Z')
    expect(isSuspended({ suspendedAt: now, suspendedUntil: suspensionEnd(7, now) }, later)).toBe(
      false,
    )
    expect(isSuspended({ suspendedAt: null, suspendedUntil: null }, now)).toBe(false)
  })
})

describe('eventOccurrences', () => {
  it("répète chaque semaine à la même heure de Paris, changement d'heure compris", () => {
    const dates = eventOccurrences({
      date: '2026-10-24',
      startTime: '19:00',
      endTime: '01:00',
      repeatWeeks: 1,
    })
    expect(dates.map((d) => d.startsAt.toISOString())).toEqual([
      '2026-10-24T17:00:00.000Z',
      '2026-10-31T18:00:00.000Z',
    ])
    // Fin après minuit : le lendemain
    expect(dates[0]?.endsAt?.toISOString()).toBe('2026-10-24T23:00:00.000Z')
  })

  it('sans heure de fin ni répétition : une seule date', () => {
    expect(
      eventOccurrences({ date: '2026-11-03', startTime: '18:30', endTime: null, repeatWeeks: 0 }),
    ).toEqual([{ startsAt: new Date('2026-11-03T17:30:00Z'), endsAt: null }])
  })
})

describe('fusion de jeux', () => {
  it('fond les formats de même slug et déplace les autres', () => {
    const { remap, move } = planFormatMerge(
      [
        { id: 's-cmd', slug: 'commander' },
        { id: 's-pauper', slug: 'pauper' },
      ],
      [{ id: 't-cmd', slug: 'commander' }],
    )
    expect([...remap]).toEqual([['s-cmd', 't-cmd']])
    expect(move).toEqual(['s-pauper'])
  })

  it('ne perd aucun joueur : chacun garde un seul profil, le plus joué', () => {
    const source = [
      { id: 's1', userId: 'alice', rankedGames: 12 },
      { id: 's2', userId: 'bob', rankedGames: 1 },
      { id: 's3', userId: 'chloe', rankedGames: 4 },
    ]
    const target = [
      { id: 't1', userId: 'alice', rankedGames: 3 },
      { id: 't2', userId: 'bob', rankedGames: 9 },
      { id: 't3', userId: 'dan', rankedGames: 0 },
    ]
    const { move, remove } = planProfileMerge(source, target)
    expect(move).toEqual(['s1', 's3'])
    expect(remove).toEqual(['t1', 's2'])
    const kept = [...source, ...target].filter((p) => !remove.includes(p.id))
    expect(kept.map((p) => p.userId).sort()).toEqual(['alice', 'bob', 'chloe', 'dan'])
  })
})
