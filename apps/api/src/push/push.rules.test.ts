import { describe, expect, it } from 'vitest'
import { quietUntil, wantsTopic } from './push.rules'

const adult = { id: 'adult', birthDate: new Date('1990-05-01'), parentId: null }
const minor = { id: 'minor', birthDate: new Date('2010-05-01'), parentId: null }

// Octobre : Paris = UTC + 2
const parisTime = (hhmm: string, day = '2026-10-06') => new Date(`${day}T${hhmm}:00+02:00`)

describe('quietUntil', () => {
  it('envoie tout de suite à un adulte, même la nuit', () => {
    expect(quietUntil(adult, parisTime('23:30'))).toBeNull()
  })

  it('envoie tout de suite à un mineur en journée', () => {
    expect(quietUntil(minor, parisTime('08:00'))).toBeNull()
    expect(quietUntil(minor, parisTime('20:59'))).toBeNull()
  })

  it('retient la notification d’un mineur jusqu’à 8 h, heure de Paris', () => {
    expect(quietUntil(minor, parisTime('21:00'))).toEqual(parisTime('08:00', '2026-10-07'))
    expect(quietUntil(minor, parisTime('23:45'))).toEqual(parisTime('08:00', '2026-10-07'))
    expect(quietUntil(minor, parisTime('06:10'))).toEqual(parisTime('08:00'))
  })
})

describe('wantsTopic', () => {
  it('respecte les sujets coupés et ignore les comptes supprimés', () => {
    expect(wantsTopic({ deletedAt: null, notificationsOff: [] }, 'ROOMS')).toBe(true)
    expect(wantsTopic({ deletedAt: null, notificationsOff: ['ROOMS'] }, 'ROOMS')).toBe(false)
    expect(wantsTopic({ deletedAt: null, notificationsOff: ['ROOMS'] }, 'MESSAGES')).toBe(true)
    expect(wantsTopic({ deletedAt: new Date(), notificationsOff: [] }, 'ROOMS')).toBe(false)
  })
})
