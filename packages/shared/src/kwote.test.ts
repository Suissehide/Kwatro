import { describe, expect, it } from 'vitest'
import {
  expectedScore,
  KWOTE_FLOOR,
  KWOTE_TOURNAMENT_WEIGHT,
  kwoteReliability,
  levelFromAnswers,
  nextKwotes,
} from './kwote'

const settled = { kwote: 1000, rankedGames: 50 }

describe('Kwote', () => {
  it('donne 50 % de chances à deux joueurs de même niveau', () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5)
  })

  it('duel : le vainqueur gagne ce que le perdant perd (K = 32 hors calibrage)', () => {
    expect(
      nextKwotes([
        { ...settled, place: 1 },
        { ...settled, place: 2 },
      ]),
    ).toEqual([1016, 984])
    expect(
      nextKwotes([
        { ...settled, place: 1 },
        { ...settled, place: 1 },
      ]),
    ).toEqual([1000, 1000])
  })

  it('bouge plus vite pendant le calibrage et en tournoi', () => {
    const [calibrating] = nextKwotes([
      { kwote: 1000, rankedGames: 3, place: 1 },
      { ...settled, place: 2 },
    ])
    const [tournament] = nextKwotes(
      [
        { ...settled, place: 1 },
        { ...settled, place: 2 },
      ],
      KWOTE_TOURNAMENT_WEIGHT,
    )
    expect(calibrating).toBe(1030)
    expect(tournament).toBe(1024)
  })

  it('pod de 4 : ordre des places respecté, somme quasi nulle, le vainqueur pèse comme en duel', () => {
    const pod = nextKwotes([1, 2, 3, 4].map((place) => ({ ...settled, place })))
    expect(pod).toEqual([1016, 1005, 995, 984])
  })

  it('battre plus fort que soi rapporte plus', () => {
    const [vsStrong] = nextKwotes([
      { ...settled, place: 1 },
      { kwote: 1300, rankedGames: 50, place: 2 },
    ])
    const [vsWeak] = nextKwotes([
      { ...settled, place: 1 },
      { kwote: 800, rankedGames: 50, place: 2 },
    ])
    expect(vsStrong).toBeGreaterThan(vsWeak)
  })

  it('ne descend jamais sous le plancher', () => {
    const [loser] = nextKwotes([
      { kwote: KWOTE_FLOOR, rankedGames: 50, place: 2 },
      { kwote: 2000, rankedGames: 50, place: 1 },
    ])
    expect(loser).toBe(KWOTE_FLOOR)
  })

  it('fiabilité : 0 au départ, 70 % par les parties, 30 % par la variété des adversaires', () => {
    expect(kwoteReliability(0, 0)).toBe(0)
    expect(kwoteReliability(10, 5)).toBe(50)
    expect(kwoteReliability(20, 1)).toBe(73)
    expect(kwoteReliability(200, 40)).toBe(100)
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
