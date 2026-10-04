import { describe, expect, it } from 'vitest'
import { compareByDistance } from './explore.rules'

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
