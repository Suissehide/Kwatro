import { afterEach, describe, expect, it, vi } from 'vitest'
import { PushService } from './push.service'

vi.mock('../config/env', () => ({ loadEnv: () => ({}) }))

const adult = (id: string, tokens: string[], notificationsOff: string[] = []) => ({
  id,
  birthDate: new Date('1990-05-01'),
  parentId: null,
  deletedAt: null,
  notificationsOff,
  pushTokens: tokens.map((token) => ({ token })),
})

function setup(users: ReturnType<typeof adult>[] = []) {
  const handlers = new Map<string, (data: never) => Promise<void>>()
  const jobs = {
    sent: [] as { name: string; data: { messages?: { to: string }[] }; options: object }[],
    handle: async (name: string, handler: (data: never) => Promise<void>) => {
      handlers.set(name, handler)
    },
    send: async (name: string, data: object, options = {}) => {
      jobs.sent.push({ name, data, options })
    },
  }
  const prisma = {
    user: { findMany: async () => users },
    pushToken: { deleteMany: vi.fn(async () => ({})) },
  }
  const service = new PushService(prisma as never, jobs as never)
  const run = (name: string, data: object) => handlers.get(name)?.(data as never)
  return { service, jobs, prisma, run }
}

const expoReplies = (...bodies: object[]) => {
  const fetchMock = vi.fn()
  for (const body of bodies)
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => body } as Response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const content = { title: 'Candidature acceptée', body: 'Ta place est réservée.' }

afterEach(() => vi.unstubAllGlobals())

describe('PushService.notify', () => {
  it('n’envoie rien à un joueur qui a coupé le sujet', async () => {
    const { service, jobs } = setup([adult('a', ['tok-a'], ['ROOMS'])])
    await service.notify(['a'], 'ROOMS', content)
    expect(jobs.sent).toEqual([])
  })

  it('envoie un message par appareil, une seule fois par joueur', async () => {
    const { service, jobs } = setup([adult('a', ['tok-a1', 'tok-a2'])])
    await service.notify(['a', 'a'], 'ROOMS', content)
    expect(jobs.sent).toHaveLength(1)
    expect(jobs.sent[0]?.data.messages?.map((m) => m.to)).toEqual(['tok-a1', 'tok-a2'])
  })
})

describe('PushService : jetons invalides', () => {
  it('supprime le jeton refusé à l’envoi et lit les autres reçus plus tard', async () => {
    const { service, jobs, prisma, run } = setup()
    await service.onModuleInit()
    expoReplies({
      data: [
        { status: 'error', details: { error: 'DeviceNotRegistered' } },
        { status: 'ok', id: 'r-1' },
      ],
    })
    await run('push', {
      messages: [
        { to: 'tok-gone', title: 't', body: 'b', sound: 'default' },
        { to: 'tok-ok', title: 't', body: 'b', sound: 'default' },
      ],
    })
    expect(prisma.pushToken.deleteMany).toHaveBeenCalledWith({
      where: { token: { in: ['tok-gone'] } },
    })
    expect(jobs.sent).toEqual([
      {
        name: 'push-receipts',
        data: { receipts: { 'r-1': 'tok-ok' } },
        options: { startAfter: expect.any(Date) },
      },
    ])
  })

  it('supprime le jeton d’un appareil désinstallé signalé dans les reçus', async () => {
    const { service, prisma, run } = setup()
    await service.onModuleInit()
    const fetchMock = expoReplies({
      data: {
        'r-1': { status: 'ok' },
        'r-2': { status: 'error', details: { error: 'DeviceNotRegistered' } },
      },
    })
    await run('push-receipts', { receipts: { 'r-1': 'tok-1', 'r-2': 'tok-2' } })
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1].body)).toEqual({ ids: ['r-1', 'r-2'] })
    expect(prisma.pushToken.deleteMany).toHaveBeenCalledWith({
      where: { token: { in: ['tok-2'] } },
    })
  })

  it('relance la tâche si Expo ne répond pas', async () => {
    const { service, run } = setup()
    await service.onModuleInit()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    await expect(run('push-receipts', { receipts: { 'r-1': 'tok-1' } })).rejects.toThrow('503')
  })
})
