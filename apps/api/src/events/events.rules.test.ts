import { describe, expect, it } from 'vitest'
import { type RegistrableEvent, registrationOutcome } from './events.rules'

const now = new Date('2026-10-04T12:00:00Z')
const adult = new Date('1990-05-01')
const event: RegistrableEvent = {
  registrationMode: 'IN_APP',
  startsAt: new Date('2026-10-04T18:00:00Z'),
  cancelledAt: null,
  minAge: null,
  capacity: 2,
}

describe('registrationOutcome', () => {
  it('inscrit tant qu’il reste des places, puis met en liste d’attente', () => {
    expect(registrationOutcome(event, 1, adult, now)).toEqual({ status: 'REGISTERED' })
    expect(registrationOutcome(event, 2, adult, now)).toEqual({ status: 'WAITLISTED' })
    expect(registrationOutcome({ ...event, capacity: null }, 99, adult, now)).toEqual({
      status: 'REGISTERED',
    })
  })

  it('refuse hors inscription dans l’app, annulé ou déjà commencé', () => {
    for (const refused of [
      { ...event, registrationMode: 'NONE' as const },
      { ...event, registrationMode: 'EXTERNAL' as const },
      { ...event, cancelledAt: now },
      { ...event, startsAt: now },
    ]) {
      expect(registrationOutcome(refused, 0, adult, now)).toHaveProperty('refused')
    }
  })

  it('applique l’âge minimum au jour de l’inscription', () => {
    const tournament = { ...event, minAge: 16 }
    expect(registrationOutcome(tournament, 0, new Date('2010-10-05'), now)).toEqual({
      refused: 'Réservé aux 16 ans et plus',
    })
    expect(registrationOutcome(tournament, 0, new Date('2010-10-04'), now)).toEqual({
      status: 'REGISTERED',
    })
  })

  it('refuse un compte sans date de naissance (âge invérifiable)', () => {
    expect(registrationOutcome(event, 0, null, now)).toEqual({
      refused: 'Renseigne ta date de naissance pour t’inscrire',
    })
  })
})
