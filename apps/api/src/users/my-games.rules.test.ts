import { describe, expect, it } from 'vitest'
import { type CatalogGame, myGamesRefusal, profileData } from './my-games.rules'

const catalog: CatalogGame[] = [
  { id: 'magic', name: 'Magic', kind: 'TCG', formatIds: ['commander', 'modern'] },
  { id: 'lorcana', name: 'Lorcana', kind: 'TCG', formatIds: ['core'] },
  { id: 'board', name: 'Jeux de société', kind: 'BOARD_GAME', formatIds: [] },
]
const level = 'INTERMEDIATE' as const

describe('myGamesRefusal', () => {
  it('accepte des TCG avec leurs formats et des jeux de société sans niveau', () => {
    const input = {
      gameIds: ['magic', 'board'],
      formats: [{ formatId: 'commander', declaredLevel: level }],
    }
    expect(myGamesRefusal(input, catalog)).toBeNull()
    expect(myGamesRefusal({ gameIds: [], formats: [] }, catalog)).toBeNull()
  })

  it('refuse un jeu inconnu, un format d’un jeu non coché, un TCG sans format', () => {
    expect(myGamesRefusal({ gameIds: ['chess'], formats: [] }, catalog)).toBe('Jeu inconnu')
    expect(
      myGamesRefusal(
        { gameIds: ['magic'], formats: [{ formatId: 'core', declaredLevel: level }] },
        catalog,
      ),
    ).toMatch(/aucun TCG/)
    expect(myGamesRefusal({ gameIds: ['lorcana'], formats: [] }, catalog)).toBe(
      'Choisis au moins un format pour Lorcana',
    )
  })
})

describe('profileData', () => {
  it('les LK de départ suivent le niveau tant qu’aucune partie classée n’est jouée', () => {
    expect(profileData(null, 'BEGINNER')).toEqual({ declaredLevel: 'BEGINNER', rating: 850 })
    expect(profileData({ rankedGames: 0 }, 'EXPERT')).toEqual({
      declaredLevel: 'EXPERT',
      rating: 1300,
    })
    expect(profileData({ rankedGames: 3 }, 'EXPERT')).toEqual({ declaredLevel: 'EXPERT' })
  })
})
