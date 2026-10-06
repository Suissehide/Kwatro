import { type Channel, channelName, channelSchema, REALTIME } from '@kwatro/shared'
import {
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { AuthService } from '../auth/auth.service'
import { eventVisibleTo, roomVisibleTo } from '../common/minors.rules'
import { loadEnv } from '../config/env'
import { notBlockedWith } from '../explore/explore.service'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

type Client = Socket<never, never, never, { user: User | null }>

/**
 * Temps réel (KWT-105) : un client suit une room ou un événement qu'il a le droit de voir,
 * et l'API lui signale chaque changement (places restantes, statut). Pas besoin d'être connecté,
 * comme pour les fiches publiques ; la session sert aux règles mineurs et blocages.
 */
// ponytail: une seule instance d'API ; adaptateur Redis (@socket.io/redis-adapter) si on en lance plusieurs
@WebSocketGateway({ cors: { origin: loadEnv().CORS_ORIGINS, credentials: true } })
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer() private readonly server!: Server

  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  /** Sur téléphone, pas de cookie automatique : l'app envoie le sien (et le joueur de démo en dev) dans `auth`. */
  async handleConnection(client: Client) {
    const { cookie, devUserId } = client.handshake.auth as Record<string, unknown>
    const headers = { ...client.handshake.headers }
    if (typeof cookie === 'string') headers.cookie = cookie
    if (typeof devUserId === 'string') headers['x-dev-user-id'] = devUserId
    client.data.user = await this.auth.resolveUser(headers).catch(() => null)
  }

  /** Suivre un canal ; l'accusé de réception vaut false s'il est introuvable ou invisible pour ce joueur. */
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
    this.server.to(channelName(channel)).emit(REALTIME.CHANGED, channel)
  }

  private async canWatch({ type, id }: Channel, user: User | null) {
    if (type === 'room') {
      const room = await this.prisma.room.findFirst({
        where: { id, ...notBlockedWith(user?.id) },
        select: { minorsAllowed: true, atHome: true, hostId: true },
      })
      return room !== null && roomVisibleTo(room, user)
    }
    const event = await this.prisma.event.findUnique({ where: { id }, select: { minAge: true } })
    return event !== null && eventVisibleTo(event, user)
  }
}
