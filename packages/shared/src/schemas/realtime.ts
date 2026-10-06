import { z } from 'zod'

/**
 * Temps réel (KWT-105) : le client suit un canal (`watch`), l'API y signale qu'il a changé (`changed`)
 * et le client recharge la fiche par HTTP. Le signal ne porte pas de données : la fiche dépend de qui la lit.
 */
export const REALTIME = { WATCH: 'watch', UNWATCH: 'unwatch', CHANGED: 'changed' } as const

export const channelSchema = z.object({
  type: z.enum(['room', 'event']),
  id: z.string().min(1).max(64),
})

export type Channel = z.infer<typeof channelSchema>

export const channelName = ({ type, id }: Channel) => `${type}:${id}`
