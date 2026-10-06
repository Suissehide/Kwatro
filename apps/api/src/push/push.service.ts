import type { NotificationTopic } from '@lucko/shared'
import { Injectable, type OnModuleInit } from '@nestjs/common'
import { loadEnv } from '../config/env'
import type { Prisma } from '../generated/prisma/client'
import { JobsService } from '../jobs/jobs.service'
import { PrismaService } from '../prisma/prisma.service'
import { quietUntil, wantsTopic } from './push.rules'

const PUSH_JOB = 'push'
const RECEIPTS_JOB = 'push-receipts'
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts'
/** Messages par requête acceptés par Expo Push. */
const EXPO_BATCH = 100
/** Reçus par requête acceptés par Expo. */
const RECEIPTS_BATCH = 1000
/** Expo conseille d'attendre 15 min avant de lire les reçus (gardés 24 h). */
const RECEIPTS_DELAY_MS = 15 * 60_000

type PushMessage = {
  to: string
  title: string
  body: string
  sound: 'default'
  data?: { url: string }
}
type ExpoTicket = { status: 'ok' | 'error'; id?: string; details?: { error?: string } }
type ExpoReceipt = { status: 'ok' | 'error'; details?: { error?: string } }
/** Reçu Expo à lire → jeton de l'appareil concerné. */
type PendingReceipts = Record<string, string>

/**
 * Contenu d'une notification ; `url` = écran de l'app ouvert au tap (ex. `/rooms/abc`).
 * Jamais d'adresse de domicile (KWT-71) : l'écran ouvert l'affiche à qui y a droit.
 */
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
    await this.jobs.handle<{ receipts: PendingReceipts }>(RECEIPTS_JOB, ({ receipts }) =>
      this.checkReceipts(receipts),
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

  /**
   * Envoie à Expo ; supprime les jetons des appareils désinstallés (DeviceNotRegistered),
   * signalés tout de suite ou plus tard dans les reçus (erreurs APNs / FCM).
   */
  private async deliver(messages: PushMessage[]) {
    const receipts: PendingReceipts = {}
    for (let i = 0; i < messages.length; i += EXPO_BATCH) {
      const batch = messages.slice(i, i + EXPO_BATCH)
      const { data } = await this.expo<ExpoTicket[]>(EXPO_PUSH_URL, batch)
      const gone: string[] = []
      batch.forEach(({ to }, j) => {
        const ticket = data[j]
        if (ticket?.details?.error === 'DeviceNotRegistered') gone.push(to)
        else if (ticket?.id) receipts[ticket.id] = to
      })
      await this.forget(gone)
    }
    if (Object.keys(receipts).length)
      await this.jobs.send(
        RECEIPTS_JOB,
        { receipts },
        { startAfter: new Date(Date.now() + RECEIPTS_DELAY_MS) },
      )
  }

  private async checkReceipts(receipts: PendingReceipts) {
    const ids = Object.keys(receipts)
    for (let i = 0; i < ids.length; i += RECEIPTS_BATCH) {
      const { data } = await this.expo<Record<string, ExpoReceipt>>(EXPO_RECEIPTS_URL, {
        ids: ids.slice(i, i + RECEIPTS_BATCH),
      })
      await this.forget(
        Object.entries(data)
          .filter(([, receipt]) => receipt.details?.error === 'DeviceNotRegistered')
          .flatMap(([id]) => receipts[id] ?? []),
      )
    }
  }

  private async expo<T>(url: string, body: unknown): Promise<{ data: T }> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      },
      body: JSON.stringify(body),
    })
    // Erreur levée = nouvel essai par pg-boss
    if (!response.ok) throw new Error(`Expo Push a répondu ${response.status}`)
    return response.json() as Promise<{ data: T }>
  }

  private async forget(tokens: string[]) {
    if (tokens.length) await this.prisma.pushToken.deleteMany({ where: { token: { in: tokens } } })
  }
}
