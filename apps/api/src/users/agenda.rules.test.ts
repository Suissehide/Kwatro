import { describe, expect, it } from 'vitest'
import { eventStatus, roomStatus } from './agenda.rules'

describe('statut dans Mes parties', () => {
  it('événement : inscrit ou en liste d’attente', () => {
    expect(eventStatus('REGISTERED')).toBe('REGISTERED')
    expect(eventStatus('WAITLISTED')).toBe('WAITLISTED')
  })

  it('room : candidature en attente, il manque des joueurs, table complète', () => {
    expect(roomStatus('PENDING', 2, 4)).toBe('PENDING')
    expect(roomStatus('WAITLISTED', 4, 4)).toBe('WAITLISTED')
    expect(roomStatus('ACCEPTED', 3, 4)).toBe('MISSING_PLAYERS')
    expect(roomStatus('ACCEPTED', 4, 4)).toBe('FULL')
  })
})
