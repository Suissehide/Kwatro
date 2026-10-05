import { describe, expect, it } from 'vitest'
import { createRoomRefusal, MAX_OPEN_ROOMS_PER_HOST, type RoomContext } from './rooms.rules'

const now = new Date('2026-10-05T12:00:00Z')
const room = {
  gameId: 'magic',
  formatId: 'commander',
  mode: 'CASUAL' as const,
  venueId: 'v1',
  startsAt: new Date('2026-10-06T18:00:00Z'),
  capacity: 4,
  minorsAllowed: false,
  autoAccept: false,
}
const ctx: RoomContext = {
  game: { kind: 'TCG', formatIds: ['commander', 'modern'] },
  venueOpen: true,
  hostIsMinor: false,
  hostOpenRooms: 0,
}
const boardGame: RoomContext = { ...ctx, game: { kind: 'BOARD_GAME', formatIds: [] } }

describe('createRoomRefusal', () => {
  it('accepte une room valide, y compris dans un lieu sans horaires', () => {
    expect(createRoomRefusal(room, ctx, now)).toBeNull()
    expect(createRoomRefusal({ ...room, mode: 'RANKED' }, ctx, now)).toBeNull()
    expect(createRoomRefusal(room, { ...ctx, venueOpen: null }, now)).toBeNull()
    expect(createRoomRefusal({ ...room, formatId: null }, boardGame, now)).toBeNull()
  })

  it('classée = TCG avec un format du jeu ; jeux de société toujours en normale', () => {
    expect(createRoomRefusal({ ...room, formatId: 'standard' }, ctx, now)).toMatch(/format/)
    expect(createRoomRefusal({ ...room, formatId: null }, ctx, now)).toBe('Choisis un format')
    expect(createRoomRefusal({ ...room, formatId: null, mode: 'RANKED' }, boardGame, now)).toMatch(
      /room normale/,
    )
  })

  it('date à venir, au plus 60 jours, lieu ouvert', () => {
    expect(createRoomRefusal({ ...room, startsAt: now }, ctx, now)).toMatch(/à venir/)
    const later = new Date('2026-12-10T18:00:00Z')
    expect(createRoomRefusal({ ...room, startsAt: later }, ctx, now)).toMatch(/60 jours/)
    expect(createRoomRefusal(room, { ...ctx, venueOpen: false }, now)).toMatch(/fermé/)
  })

  it('hôte mineur : room ouverte aux mineurs ; limite de rooms à venir', () => {
    const minor = { ...ctx, hostIsMinor: true }
    expect(createRoomRefusal(room, minor, now)).toMatch(/mineurs/)
    expect(createRoomRefusal({ ...room, minorsAllowed: true }, minor, now)).toBeNull()
    const busy = { ...ctx, hostOpenRooms: MAX_OPEN_ROOMS_PER_HOST }
    expect(createRoomRefusal(room, busy, now)).toMatch(/déjà/)
  })
})
