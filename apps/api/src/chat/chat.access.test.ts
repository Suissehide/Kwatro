import { describe, expect, it } from 'vitest'
import type { User } from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'
import { chatAccess } from './chat.access'

const person = (id: string, birthDate: string) =>
  ({ id, birthDate: new Date(birthDate), parentId: null }) as User
const host = person('host', '1990-01-01')
const player = person('player', '1992-01-01')
const outsider = person('outsider', '1990-01-01')
const minor = person('minor', '2011-01-01')
const staff = person('staff', '1985-01-01')

const room = (minorsAllowed: boolean) => ({
  hostId: 'host',
  minorsAllowed,
  atHome: false,
  game: { name: 'Magic' },
  format: { name: 'Commander' },
  participants: [{ userId: 'player' }, { userId: 'minor' }],
})

function prisma(rooms: Record<string, ReturnType<typeof room>>) {
  return {
    room: { findFirst: async ({ where }: { where: { id: string } }) => rooms[where.id] ?? null },
    event: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id.startsWith('e')
          ? {
              title: 'Tournoi Pauper',
              minAge: where.id === 'e18' ? 18 : null,
              registrations: [{ userId: 'player' }, { userId: 'minor' }],
              venue: { staff: [{ userId: 'staff' }] },
            }
          : null,
    },
  } as unknown as PrismaService
}

describe('chatAccess', () => {
  const db = prisma({ open: room(true), adults: room(false) })

  it("room : l'hôte modère, un joueur accepté écrit, un autre n'entre pas", async () => {
    expect(await chatAccess(db, { type: 'room', id: 'open' }, host)).toMatchObject({
      moderator: true,
      memberIds: ['host', 'player', 'minor'],
      title: 'Commander',
    })
    expect(await chatAccess(db, { type: 'room', id: 'open' }, player)).toMatchObject({
      moderator: false,
    })
    expect(await chatAccess(db, { type: 'room', id: 'open' }, outsider)).toBeNull()
    expect(await chatAccess(db, { type: 'room', id: 'inconnue' }, host)).toBeNull()
  })

  it("un mineur n'accède pas au chat d'une room réservée aux adultes", async () => {
    expect(await chatAccess(db, { type: 'room', id: 'open' }, minor)).not.toBeNull()
    expect(await chatAccess(db, { type: 'room', id: 'adults' }, minor)).toBeNull()
  })

  it('événement : le staff du lieu modère, les inscrits écrivent, 18+ fermé aux mineurs', async () => {
    expect(await chatAccess(db, { type: 'event', id: 'e1' }, staff)).toMatchObject({
      moderator: true,
      title: 'Tournoi Pauper',
    })
    expect(await chatAccess(db, { type: 'event', id: 'e1' }, player)).toMatchObject({
      moderator: false,
    })
    expect(await chatAccess(db, { type: 'event', id: 'e1' }, outsider)).toBeNull()
    expect(await chatAccess(db, { type: 'event', id: 'e18' }, minor)).toBeNull()
  })
})
