import type { ChatRef } from '@lucko/shared'
import { eventVisibleTo, roomVisibleTo } from '../common/minors.rules'
import { notBlockedWith } from '../explore/explore.service'
import type { User } from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'

/** Droits d'un joueur sur un chat, et qui le lit (destinataires des push). */
export type ChatAccess = {
  /** Hôte de la room, ou staff du lieu de l'événement : annonces et suppression. */
  moderator: boolean
  memberIds: string[]
  /** Nom de la room ou de l'événement, pour le titre des push. */
  title: string
  /** En-tête du chat. */
  startsAt: Date
  venueName: string | null
  players: number
  capacity: number | null
}

/**
 * Seuls les membres lisent et écrivent (LKO-80) : l'hôte et les joueurs acceptés d'une room, les inscrits
 * d'un événement et le staff du lieu. null sinon. Partagé par l'API et la passerelle temps réel.
 * Pas de messages privés : un mineur ne parle qu'aux membres d'une room ou d'un événement qu'il peut voir.
 */
export async function chatAccess(
  prisma: PrismaService,
  { type, id }: ChatRef,
  user: User,
): Promise<ChatAccess | null> {
  if (type === 'room') {
    const room = await prisma.room.findFirst({
      where: { id, ...notBlockedWith(user.id) },
      select: {
        hostId: true,
        minorsAllowed: true,
        atHome: true,
        startsAt: true,
        capacity: true,
        venue: { select: { name: true, acceptsUnaccompaniedMinors: true } },
        game: { select: { name: true } },
        format: { select: { name: true } },
        participants: { where: { status: 'ACCEPTED' }, select: { userId: true } },
      },
    })
    if (!room || !roomVisibleTo(room, user)) return null
    const memberIds = [...new Set([room.hostId, ...room.participants.map((p) => p.userId)])]
    if (!memberIds.includes(user.id)) return null
    return {
      moderator: room.hostId === user.id,
      memberIds,
      title: room.format?.name ?? room.game.name,
      startsAt: room.startsAt,
      venueName: room.venue?.name ?? null,
      players: memberIds.length,
      capacity: room.capacity,
    }
  }
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      title: true,
      minAge: true,
      startsAt: true,
      registrations: { where: { status: 'REGISTERED' }, select: { userId: true } },
      venue: { select: { name: true, staff: { select: { userId: true } } } },
    },
  })
  if (!event || !eventVisibleTo(event, user)) return null
  const staffIds = event.venue.staff.map((s) => s.userId)
  const memberIds = [...new Set([...staffIds, ...event.registrations.map((r) => r.userId)])]
  if (!memberIds.includes(user.id)) return null
  return {
    moderator: staffIds.includes(user.id),
    memberIds,
    title: event.title,
    startsAt: event.startsAt,
    venueName: event.venue.name,
    players: event.registrations.length,
    capacity: null,
  }
}
