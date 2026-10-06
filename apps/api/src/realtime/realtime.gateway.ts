import { type Channel, channelName, channelSchema, REALTIME } from '@kwatro/shared'
import {
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { AuthService } from '../auth/auth.service'
import { eventVisibleTo, roomVisibleTo } from '../common/minors.rules'
import { loadEnv } from '../config/env'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

type Client = Socket<never, never, never, { user: User }>

/** Membres d'une room : l'hôte et les joueurs acceptés, en attente ou sur liste d'attente. */
const MEMBER_STATUSES = ['ACCEPTED', 'PENDING', 'WAITLISTED'] as const

/**
 * Temps réel (KWT-105) : un joueur connecté suit une room dont il est membre ou un événement qu'il peut voir,
 * et l'API lui signale chaque changement (places restantes, statut). Contrat dans @kwatro/shared (REALTIME).
 */
// ponytail: une seule instance d'API ; adaptateur Redis (@socket.io/redis-adapter) si on en lance plusieurs
@WebSocketGateway({ cors: { origin: loadEnv().CORS_ORIGINS, credentials: true } })
export class RealtimeGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server

  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Connexion refusée sans session. Sur téléphone, pas de cookie automatique : l'app envoie le sien
   * (et le joueur de démo en dev) dans `auth`.
   */
  afterInit(server: Server) {
    server.use(async (socket, next) => {
      const { cookie, devUserId } = socket.handshake.auth as Record<string, unknown>
      const headers = { ...socket.handshake.headers }
      if (typeof cookie === 'string') headers.cookie = cookie
      if (typeof devUserId === 'string') headers['x-dev-user-id'] = devUserId
      const user = await this.auth.resolveUser(headers).catch(() => null)
      if (!user) return next(new Error('Connexion requise'))
      socket.data.user = user
      next()
    })
  }

  /** Suivre un canal ; l'accusé de réception vaut false si le joueur n'y a pas droit. */
  @SubscribeMessage(REALTIME.WATCH)
  async watch(client: Client, payload: unknown) {
    const channel = channelSchema.safeParse(payload)
    if (!channel.success || !(await this.canWatch(channel.data, client.data.user))) return false
    await client.join(channelName(channel.data))
    return true
  }

  @SubscribeMessage(REALTIME.UNWATCH)
  async unwatch(client: Client, payload: unknown) {
    const channel = channelSchema.safeParse(payload)
    if (channel.success) await client.leave(channelName(channel.data))
    return true
  }

  /** À appeler après le commit : les clients qui suivent le canal rechargent la fiche. */
  changed(channel: Channel) {
    const message = channelSchema.parse(channel)
    this.server.to(channelName(message)).emit(REALTIME.CHANGED, message)
  }

  /** Joueurs qui ne sont plus membres (départ, retrait, refus) : ils ne suivent plus le canal. */
  async revoke(channel: Channel, userIds: string[]) {
    const sockets = await this.server.in(channelName(channel)).fetchSockets()
    for (const socket of sockets)
      if (userIds.includes(socket.data.user.id)) socket.leave(channelName(channel))
  }

  private async canWatch({ type, id }: Channel, user: User) {
    if (type === 'room') {
      const room = await this.prisma.room.findUnique({
        where: { id },
        select: {
          minorsAllowed: true,
          atHome: true,
          hostId: true,
          participants: {
            where: { userId: user.id, status: { in: [...MEMBER_STATUSES] } },
            select: { userId: true },
          },
        },
      })
      if (!room || !roomVisibleTo(room, user)) return false
      return room.hostId === user.id || room.participants.length > 0
    }
    const event = await this.prisma.event.findUnique({ where: { id }, select: { minAge: true } })
    return event !== null && eventVisibleTo(event, user)
  }
}
