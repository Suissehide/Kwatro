import type { NotificationTopic } from '@kwatro/shared'
import { Injectable, type OnModuleInit } from '@nestjs/common'
import { loadEnv } from '../config/env'
import type { Prisma } from '../generated/prisma/client'
import { JobsService } from '../jobs/jobs.service'
import { PrismaService } from '../prisma/prisma.service'
import { quietUntil, wantsTopic } from './push.rules'

const PUSH_JOB = 'push'
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
/** Messages par requête acceptés par Expo Push. */
const EXPO_BATCH = 100

type PushMessage = {
  to: string
  title: string
  body: string
  sound: 'default'
  data?: { url: string }
}
type ExpoTicket = { status: 'ok' | 'error'; details?: { error?: string } }

/** Contenu d'une notification ; `url` = écran de l'app ouvert au tap (ex. `/rooms/abc`). */
export type PushContent = { title: string; body: string; url?: string }

/**
 * Notifications push (KWT-108) via Expo Push, un seul service pour iOS et Android.
 * Les envois passent par la file pg-boss : nouvel essai si Expo ne répond pas, envoi différé
 * pour les mineurs la nuit, et rien n'est envoyé si la transaction appelante échoue.
 */
@Injectable()
export class PushService implements OnModuleInit {
  private readonly accessToken = loadEnv().EXPO_ACCESS_TOKEN

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
  ) {}

  async onModuleInit() {
    await this.jobs.handle<{ messages: PushMessage[] }>(PUSH_JOB, ({ messages }) =>
      this.deliver(messages),
    )
  }

  /**
   * Prévient des joueurs sur tous leurs appareils, sauf s'ils ont coupé ce sujet.
   * Avec `tx`, la notification ne part que si la transaction est validée.
   */
  async notify(
    userIds: string[],
    topic: NotificationTopic,
    { title, body, url }: PushContent,
    tx?: Prisma.TransactionClient,
  ) {
    if (!userIds.length) return
    const users = await (tx ?? this.prisma).user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        birthDate: true,
        parentId: true,
        deletedAt: true,
        notificationsOff: true,
        pushTokens: { select: { token: true } },
      },
    })
    // Un envoi par heure de départ : tout de suite (0), ou 8 h pour les mineurs la nuit
    const batches = new Map<number, PushMessage[]>()
    const now = new Date()
    for (const user of users) {
      if (!wantsTopic(user, topic)) continue
      const at = quietUntil(user, now)?.getTime() ?? 0
      const messages = user.pushTokens.map(
        ({ token }): PushMessage => ({
          to: token,
          title,
          body,
          sound: 'default',
          ...(url ? { data: { url } } : {}),
        }),
      )
      batches.set(at, [...(batches.get(at) ?? []), ...messages])
    }
    for (const [at, messages] of batches) {
      if (messages.length)
        await this.jobs.send(PUSH_JOB, { messages }, at ? { startAfter: new Date(at) } : {}, tx)
    }
  }

  /** Envoie à Expo ; supprime les jetons des appareils désinstallés (DeviceNotRegistered). */
  // ponytail: pas de lecture des reçus Expo (erreurs APNs / FCM différées), à ajouter si des envois se perdent
  private async deliver(messages: PushMessage[]) {
    for (let i = 0; i < messages.length; i += EXPO_BATCH) {
      const batch = messages.slice(i, i + EXPO_BATCH)
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        },
        body: JSON.stringify(batch),
      })
      // Erreur levée = nouvel essai par pg-boss
      if (!response.ok) throw new Error(`Expo Push a répondu ${response.status}`)
      const { data } = (await response.json()) as { data: ExpoTicket[] }
      const gone = batch
        .filter((_, j) => data[j]?.details?.error === 'DeviceNotRegistered')
        .map((m) => m.to)
      if (gone.length) await this.prisma.pushToken.deleteMany({ where: { token: { in: gone } } })
    }
  }
}
