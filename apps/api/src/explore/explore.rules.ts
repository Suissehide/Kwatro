import { PARTNER_TIE_METERS, VENUE_TIME_ZONE } from '@kwatro/shared'

export type OpeningRange = { weekday: number; opensAtMinute: number; closesAtMinute: number }

/** Jour ISO (1 = lundi) et minute depuis minuit à l'heure locale du lieu. */
export function localWeekdayMinute(now: Date, timeZone = VENUE_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')) + 1
  return { weekday, minute: Number(get('hour')) * 60 + Number(get('minute')) }
}

/**
 * Ouvert maintenant ? Une plage dont la fermeture précède l'ouverture déborde sur le lendemain
 * (17 h → 1 h). null si le lieu n'a aucun horaire renseigné.
 */
export function openingStatus(hours: OpeningRange[], now: Date, timeZone = VENUE_TIME_ZONE) {
  if (hours.length === 0) return { openNow: null, closesAtMinute: null }
  const { weekday, minute } = localWeekdayMinute(now, timeZone)
  const yesterday = weekday === 1 ? 7 : weekday - 1
  const current = hours.find((h) => {
    const overnight = h.closesAtMinute <= h.opensAtMinute
    if (h.weekday === weekday) {
      return minute >= h.opensAtMinute && (overnight || minute < h.closesAtMinute)
    }
    return overnight && h.weekday === yesterday && minute < h.closesAtMinute
  })
  return { openNow: !!current, closesAtMinute: current?.closesAtMinute ?? null }
}

/**
 * Tri honnête : la distance d'abord, par tranches de PARTNER_TIE_METERS ; dans une même tranche,
 * les partenaires passent devant, puis la distance exacte départage.
 */
export function compareByDistance(
  a: { distanceMeters: number; isPartner: boolean },
  b: { distanceMeters: number; isPartner: boolean },
) {
  const bucket = (d: number) => Math.floor(d / PARTNER_TIE_METERS)
  return (
    bucket(a.distanceMeters) - bucket(b.distanceMeters) ||
    Number(b.isPartner) - Number(a.isPartner) ||
    a.distanceMeters - b.distanceMeters
  )
}
