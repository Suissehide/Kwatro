import { describe, expect, it } from 'vitest'
import { expectedScore, levelFromAnswers, nextRating, RATING_FLOOR } from './rating'

describe('LK', () => {
  it('donne 50 % de chances à deux joueurs de même niveau', () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5)
  })

  it('fait monter le vainqueur et bouge plus vite pendant le calibrage', () => {
    const calibrating = nextRating(1000, 1000, 1, { gamesPlayed: 3 })
    const settled = nextRating(1000, 1000, 1, { gamesPlayed: 50 })
    expect(calibrating).toBeGreaterThan(settled)
    expect(settled).toBeGreaterThan(1000)
  })

  it('ne descend jamais sous le plancher', () => {
    expect(nextRating(RATING_FLOOR, 2000, 0, { gamesPlayed: 50 })).toBe(RATING_FLOOR)
  })
})

describe('levelFromAnswers', () => {
  it('total des 3 réponses : 0-2 débutant, 3-4 intermédiaire, 5-6 confirmé, 7-9 expert', () => {
    expect(levelFromAnswers([0, 1, 1])).toBe('BEGINNER')
    expect(levelFromAnswers([1, 1, 1])).toBe('INTERMEDIATE')
    expect(levelFromAnswers([2, 2, 2])).toBe('CONFIRMED')
    expect(levelFromAnswers([3, 2, 2])).toBe('EXPERT')
    expect(levelFromAnswers([3, 3, 3])).toBe('EXPERT')
  })
})
