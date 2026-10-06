import {
  type createRoomSchema,
  type HostAction,
  openingStatus,
  RATING_PROVISIONAL_GAMES,
  type RoomStatus,
  type roomDetailSchema,
} from '@lucko/shared'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { z } from 'zod'
import { isMinor, roomVisibleTo, type Viewer } from '../common/minors.rules'
import { closureRange, notBlockedWith } from '../explore/explore.service'
import type { Prisma, User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PushService } from '../push/push.service'
import { RealtimeGateway } from '../realtime/realtime.gateway'
import {
  acceptRefusal,
  createRoomRefusal,
  fillStatus,
  hostActionRefusal,
  joinOutcome,
  lifecycleStatus,
  promotedStatus,
} from './rooms.rules'

type Tx = Prisma.TransactionClient

const detailInclude = {
  host: { select: { pseudo: true } },
  game: { select: { slug: true, name: true } },
  format: { select: { name: true } },
  venue: { select: { id: true, slug: true, name: true, address: true, isPartner: true } },
  participants: {
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          pseudo: true,
          birthDate: true,
          parentId: true,
          xp: true,
          gameProfiles: true,
        },
      },
    },
  },
} satisfies Prisma.RoomInclude

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly realtime: RealtimeGateway,
  ) {}

  /** Crée la room ; l'hôte en est le premier joueur accepté. */
  async create(host: User, input: z.output<typeof createRoomSchema>) {
    const now = new Date()
    const [game, venue, hostOpenRooms] = await Promise.all([
      this.prisma.game.findUnique({
        where: { id: input.gameId },
        include: { formats: true },
      }),
      this.prisma.venue.findUnique({
        where: { id: input.venueId },
        include: { openingHours: true, closures: { where: { endsOn: { gte: now } } } },
      }),
      this.prisma.room.count({
        where: { hostId: host.id, status: { in: ['OPEN', 'FULL'] }, startsAt: { gte: now } },
      }),
    ])
    if (!game) throw new NotFoundException('Jeu introuvable')
    if (!venue) throw new NotFoundException('Lieu introuvable')

    const refusal = createRoomRefusal(
      input,
      {
        game,
        venueOpen: openingStatus(
          venue.openingHours,
          venue.closures.map(closureRange),
          input.startsAt,
        ).openNow,
        hostIsMinor: isMinor(host, now),
        hostOpenRooms,
      },
      now,
    )
    if (refusal) throw new BadRequestException(refusal)

    return this.prisma.room.create({
      data: {
        ...input,
        formatId: input.formatId ?? null,
        bracket: input.bracket ?? null,
        description: input.description || null,
        hostId: host.id,
        participants: { create: { userId: host.id, status: 'ACCEPTED' } },
      },
      select: { id: true },
    })
  }

  /**
   * Fiche room (B6). Introuvable si le joueur ne peut pas la voir (règles mineurs, blocage).
   * Pseudos des joueurs pour les membres, initiales pour les autres ; candidatures pour l'hôte seulement.
   */
  async detail(id: string, viewer: Viewer): Promise<z.output<typeof roomDetailSchema>> {
    const now = new Date()
    const room = await this.prisma.room.findFirst({
      where: { id, ...notBlockedWith(viewer?.id) },
      include: detailInclude,
    })
    if (!room || !roomVisibleTo(room, viewer, now)) throw new NotFoundException('Room introuvable')

    const isHost = room.hostId === viewer?.id
    const mine = room.participants.find((p) => p.userId === viewer?.id)
    const member = isHost || mine?.status === 'ACCEPTED'
    const accepted = room.participants.filter((p) => p.status === 'ACCEPTED')
    const waiting = room.participants.filter(
      (p) => p.status === 'PENDING' || p.status === 'WAITLISTED',
    )
    return {
      ...room,
      status: lifecycleStatus(room, now),
      format: room.format?.name ?? null,
      players: accepted.map(({ userId, user }) => ({
        initial: user.pseudo?.slice(0, 1) ?? '?',
        pseudo: member ? user.pseudo : null,
        userId: isHost ? userId : null,
      })),
      waitlistCount: room.participants.filter((p) => p.status === 'WAITLISTED').length,
      myStatus: isHost ? 'ACCEPTED' : (mine?.status ?? null),
      isHost,
      candidates: isHost
        ? waiting.map(({ userId, status, createdAt, user }) => {
            const profile = user.gameProfiles.find((g) => g.formatId === room.formatId)
            return {
              userId,
              pseudo: user.pseudo,
              status: status as 'PENDING' | 'WAITLISTED',
              minor: isMinor(user, now),
              xp: user.xp,
              rating:
                profile && profile.rankedGames >= RATING_PROVISIONAL_GAMES ? profile.rating : null,
              rankedGames: profile?.rankedGames ?? 0,
              appliedAt: createdAt,
            }
          })
        : [],
    }
  }

  /** Demander à rejoindre : en attente de l'hôte, acceptée d'office ou liste d'attente (rooms.rules). */
  async join(id: string, user: User) {
    await this.prisma.$transaction(async (tx) => {
      const room = await this.lock(tx, id, user)
      const current = room.participants.find((p) => p.userId === user.id)?.status ?? null
      const outcome = joinOutcome(room, accepted(room), user.id, current)
      if ('refused' in outcome) throw new ConflictException(outcome.refused)
      if (outcome.status === current) return
      await tx.roomParticipant.upsert({
        where: { roomId_userId: { roomId: id, userId: user.id } },
        // Nouvelle demande après un départ : en fin de file
        update: { status: outcome.status, createdAt: new Date() },
        create: { roomId: id, userId: user.id, status: outcome.status },
      })
      await this.refreshStatus(tx, id)
    })
    this.realtime.changed({ type: 'room', id })
    return this.detail(id, user)
  }

  /**
   * Quitter la room ou retirer sa demande. Une place libérée revient au premier de la liste d'attente.
   */
  async leave(id: string, user: User) {
    await this.prisma.$transaction(async (tx) => {
      const room = await this.lock(tx, id, user)
      if (room.hostId === user.id)
        throw new ConflictException('L’hôte ne peut pas quitter sa room : annule-la')
      const mine = room.participants.find((p) => p.userId === user.id)
      if (!mine || mine.status === 'LEFT' || mine.status === 'DECLINED') return
      await tx.roomParticipant.update({
        where: { roomId_userId: { roomId: id, userId: user.id } },
        data: { status: 'LEFT' },
      })
      if (mine.status === 'ACCEPTED') await this.promote(tx, room)
      await this.refreshStatus(tx, id)
    })
    await this.realtime.revoke({ type: 'room', id }, [user.id])
    this.realtime.changed({ type: 'room', id })
    return this.detail(id, user)
  }

  /** L'hôte accepte (`accept`) ou refuse une demande. */
  async decide(id: string, host: User, userId: string, accept: boolean) {
    await this.prisma.$transaction(async (tx) => {
      const room = await this.lock(tx, id, host)
      if (room.hostId !== host.id) throw new ForbiddenException('Réservé à l’hôte de la room')
      const candidate = room.participants.find((p) => p.userId === userId)?.status ?? null
      const refusal = accept
        ? acceptRefusal(candidate, accepted(room), room.capacity)
        : candidate === 'PENDING' || candidate === 'WAITLISTED'
          ? null
          : 'Pas de demande en attente'
      if (refusal) throw new ConflictException(refusal)
      await tx.roomParticipant.update({
        where: { roomId_userId: { roomId: id, userId } },
        data: { status: accept ? 'ACCEPTED' : 'DECLINED' },
      })
      await this.refreshStatus(tx, id)
      if (accept)
        await this.push.notify(
          [userId],
          'ROOMS',
          {
            title: 'Candidature acceptée',
            body: 'Ta place est réservée. Retrouve la room dans Mes parties.',
            url: `/rooms/${id}`,
          },
          tx,
        )
    })
    if (!accept) await this.realtime.revoke({ type: 'room', id }, [userId])
    this.realtime.changed({ type: 'room', id })
    return this.detail(id, host)
  }

  /**
   * Action de l'hôte (LKO-57) : retirer un joueur (il ne peut plus revenir, sa place revient à la liste
   * d'attente), transférer le rôle d'hôte à un joueur accepté, fermer / rouvrir les inscriptions, annuler.
   */
  // ponytail: annulation sans délai ni effet sur la fiabilité
  async hostAction(id: string, host: User, action: HostAction) {
    await this.prisma.$transaction(async (tx) => {
      const room = await this.lock(tx, id, host)
      if (room.hostId !== host.id) throw new ForbiddenException('Réservé à l’hôte de la room')
      const target = 'userId' in action ? action.userId : null
      const participant = room.participants.find((p) => p.userId === target)?.status ?? null
      const refusal = hostActionRefusal(room, action, participant)
      if (refusal) throw new ConflictException(refusal)
      switch (action.type) {
        case 'remove':
          await tx.roomParticipant.update({
            where: { roomId_userId: { roomId: id, userId: action.userId } },
            data: { status: 'DECLINED' },
          })
          await this.promote(tx, room)
          break
        case 'transfer':
          await tx.room.update({ where: { id }, data: { hostId: action.userId } })
          break
        case 'close':
          await tx.room.update({ where: { id }, data: { status: 'CONFIRMED' } })
          break
        case 'reopen':
          // refreshStatus la repasse ensuite en ouverte ou complète ; places libérées pendant la fermeture
          await tx.room.update({ where: { id }, data: { status: 'OPEN' } })
          await this.promote(tx, { ...room, status: 'OPEN' }, room.capacity - accepted(room))
          break
        case 'cancel':
          await tx.room.update({ where: { id }, data: { status: 'CANCELLED' } })
          // Joueurs acceptés, en attente ou sur liste d'attente : tous prévenus
          await this.push.notify(
            room.participants
              .filter((p) => p.userId !== host.id && p.status !== 'DECLINED' && p.status !== 'LEFT')
              .map((p) => p.userId),
            'ROOMS',
            {
              title: 'Room annulée',
              body: 'L’hôte a annulé une room où tu étais inscrit·e.',
              url: `/rooms/${id}`,
            },
            tx,
          )
          break
      }
      await this.refreshStatus(tx, id)
    })
    if (action.type === 'remove') await this.realtime.revoke({ type: 'room', id }, [action.userId])
    this.realtime.changed({ type: 'room', id })
    return this.detail(id, host)
  }

  /** Verrou sur la room (deux demandes simultanées ne prennent pas la même dernière place), visibilité comprise. */
  private async lock(tx: Tx, id: string, user: User) {
    await tx.$queryRaw`SELECT 1 FROM "Room" WHERE "id" = ${id} FOR UPDATE`
    const room = await tx.room.findFirst({
      where: { id, ...notBlockedWith(user.id) },
      include: { participants: { orderBy: { createdAt: 'asc' } } },
    })
    if (!room || !roomVisibleTo(room, user)) throw new NotFoundException('Room introuvable')
    return room
  }

  /**
   * Places libérées (`count`) : les premiers de la liste d'attente passent devant. Rien si les inscriptions
   * sont fermées (room confirmée) : ce sera fait à la réouverture.
   */
  private async promote(
    tx: Tx,
    room: { id: string; autoAccept: boolean; status: RoomStatus },
    count = 1,
  ) {
    if (count <= 0 || (room.status !== 'OPEN' && room.status !== 'FULL')) return
    const next = await tx.roomParticipant.findMany({
      where: { roomId: room.id, status: 'WAITLISTED' },
      orderBy: { createdAt: 'asc' },
      take: count,
    })
    await tx.roomParticipant.updateMany({
      where: { roomId: room.id, userId: { in: next.map((p) => p.userId) } },
      data: { status: promotedStatus(room.autoAccept) },
    })
    if (room.autoAccept)
      await this.push.notify(
        next.map((p) => p.userId),
        'ROOMS',
        {
          title: 'Une place s’est libérée',
          body: 'Tu passes de la liste d’attente à la table.',
          url: `/rooms/${room.id}`,
        },
        tx,
      )
  }

  /** Ouverte / complète selon les acceptés (une room confirmée, annulée… ne bouge pas). */
  private async refreshStatus(tx: Tx, id: string) {
    const room = await tx.room.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { participants: { where: { status: 'ACCEPTED' } } } } },
    })
    if (room.status !== 'OPEN' && room.status !== 'FULL') return
    const status = fillStatus(room._count.participants, room.capacity)
    if (status !== room.status) await tx.room.update({ where: { id }, data: { status } })
  }
}

const accepted = (room: { participants: { status: string }[] }) =>
  room.participants.filter((p) => p.status === 'ACCEPTED').length
