import { describe, expect, it } from 'vitest'
import { expectedScore, KWOTE_FLOOR, nextKwote } from './kwote'

describe('Kwote', () => {
  it('donne 50 % de chances à deux joueurs de même niveau', () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5)
  })

  it('fait monter le vainqueur et bouge plus vite pendant le calibrage', () => {
    const calibrating = nextKwote(1000, 1000, 1, { gamesPlayed: 3 })
    const settled = nextKwote(1000, 1000, 1, { gamesPlayed: 50 })
    expect(calibrating).toBeGreaterThan(settled)
    expect(settled).toBeGreaterThan(1000)
  })

  it('ne descend jamais sous le plancher', () => {
    expect(nextKwote(KWOTE_FLOOR, 2000, 0, { gamesPlayed: 50 })).toBe(KWOTE_FLOOR)
  })
})
