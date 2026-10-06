import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { REALTIME } from '@kwatro/shared'
import { Server } from 'socket.io'
import { io, type Socket } from 'socket.io-client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { AuthService } from '../auth/auth.service'
import type { User } from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'
import { RealtimeGateway } from './realtime.gateway'

const adult = { id: 'adult', birthDate: new Date('1990-01-01'), parentId: null } as User
const host = { id: 'host', birthDate: new Date('1990-01-01'), parentId: null } as User
const users: Record<string, User> = { adult, host }

/** Room r1 tenue par `host`, dont `adult` n'est pas membre. */
const prisma = {
  room: {
    findUnique: async ({ where }: { where: { id: string } }) =>
      where.id === 'r1'
        ? { minorsAllowed: false, atHome: false, hostId: 'host', participants: [] }
        : null,
  },
  event: { findUnique: async () => ({ minAge: null }) },
} as unknown as PrismaService
const auth = {
  resolveUser: async (headers: Record<string, unknown>) =>
    users[headers['x-dev-user-id'] as string] ?? null,
} as unknown as AuthService

let gateway: RealtimeGateway
let url: string
const clients: Socket[] = []

/** Socket.IO réel, branché comme le fait Nest : middleware de connexion puis messages avec accusé. */
beforeAll(async () => {
  const http = createServer()
  const server = new Server(http)
  gateway = new RealtimeGateway(auth, prisma)
  gateway.server = server
  gateway.afterInit(server)
  server.on('connection', (socket) => {
    socket.on(REALTIME.WATCH, (payload, ack) => void gateway.watch(socket, payload).then(ack))
  })
  await new Promise<void>((resolve) => http.listen(0, resolve))
  url = `http://localhost:${(http.address() as AddressInfo).port}`
  return () => server.close()
})
afterAll(() => {
  for (const client of clients) client.close()
})

function connect(devUserId?: string) {
  const client = io(url, { transports: ['websocket'], auth: { devUserId }, reconnection: false })
  clients.push(client)
  return new Promise<Socket>((resolve, reject) => {
    client.on('connect', () => resolve(client))
    client.on('connect_error', reject)
  })
}

describe('RealtimeGateway', () => {
  it('refuse la connexion sans session', async () => {
    await expect(connect()).rejects.toThrow('Connexion requise')
  })

  it("refuse l'abonnement à une room dont le joueur n'est pas membre", async () => {
    const client = await connect('adult')
    expect(await client.emitWithAck(REALTIME.WATCH, { type: 'room', id: 'r1' })).toBe(false)
    expect(await client.emitWithAck(REALTIME.WATCH, { type: 'room', id: 'inconnue' })).toBe(false)
    expect(await client.emitWithAck(REALTIME.WATCH, { type: 'chat', id: 'r1' })).toBe(false)
  })

  it('signale les changements aux membres, plus après un retrait', async () => {
    const member = await connect('host')
    const outsider = await connect('adult')
    expect(await member.emitWithAck(REALTIME.WATCH, { type: 'room', id: 'r1' })).toBe(true)
    let outsiderNotified = false
    outsider.on(REALTIME.CHANGED, () => {
      outsiderNotified = true
    })

    const received = new Promise((resolve) => member.once(REALTIME.CHANGED, resolve))
    gateway.changed({ type: 'room', id: 'r1' })
    expect(await received).toEqual({ type: 'room', id: 'r1' })
    expect(outsiderNotified).toBe(false)

    await gateway.revoke({ type: 'room', id: 'r1' }, ['host'])
    const sockets = await gateway.server.in('room:r1').fetchSockets()
    expect(sockets).toHaveLength(0)
  })

  it('ouvre le canal événement à tout joueur connecté qui peut le voir', async () => {
    const client = await connect('adult')
    expect(await client.emitWithAck(REALTIME.WATCH, { type: 'event', id: 'e1' })).toBe(true)
  })
})
