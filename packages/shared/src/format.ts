import { VENUE_TIME_ZONE } from './constants'

/** « 800 m », « 1,2 km », « 12 km ». */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`
  const km = meters / 1000
  return `${km.toLocaleString('fr-FR', { maximumFractionDigits: km < 10 ? 1 : 0 })} km`
}

/** « Gratuit », « 8 € », « 7,50 € ». null = prix non renseigné. */
export function formatPrice(cents: number | null): string | null {
  if (cents === null) return null
  if (cents === 0) return 'Gratuit'
  const euros = cents / 100
  return `${euros.toLocaleString('fr-FR', { minimumFractionDigits: cents % 100 ? 2 : 0 })} €`
}

/** Heure locale du lieu, « 19:30 ». */
export function formatTime(date: Date | string, timeZone = VENUE_TIME_ZONE): string {
  return new Intl.DateTimeFormat('fr-FR', { timeZone, hour: '2-digit', minute: '2-digit' }).format(
    new Date(date),
  )
}

/** Jour et mois abrégé pour un bloc date : { day: '06', month: 'OCT' }. */
export function formatDayMonth(date: Date | string, timeZone = VENUE_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone,
    day: '2-digit',
    month: 'short',
  }).formatToParts(new Date(date))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { day: get('day'), month: get('month').replace('.', '').slice(0, 3).toUpperCase() }
}

/** Minutes depuis minuit → « 1 h », « 19 h 30 ». */
export function formatMinuteOfDay(minute: number): string {
  const h = Math.floor(minute / 60)
  const m = minute % 60
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

export function formatHour(date: Date | string, timeZone = VENUE_TIME_ZONE): string {
  const [h = 0, m = 0] = formatTime(date, timeZone).split(':').map(Number)
  return formatMinuteOfDay(h * 60 + m)
}

export function formatHourBand(date: Date | string, timeZone = VENUE_TIME_ZONE): string {
  const [h = '0', m = '00'] = formatTime(date, timeZone).split(':')
  return `${Number(h)}H${m === '00' ? '' : m}`
}

export function formatKwote(value: number): string {
  return value.toLocaleString('fr-FR')
}

const localDay = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(date)

const DAY_MS = 24 * 60 * 60 * 1000

/** Groupe d'une partie dans Mes parties : « Ce soir », « Cette semaine », sinon le mois (« Octobre », « Janvier 2027 »). */
export function agendaGroup(
  date: Date | string,
  { now = new Date(), past = false, timeZone = VENUE_TIME_ZONE } = {},
): string {
  const at = new Date(date)
  if (!past) {
    if (localDay(at, timeZone) === localDay(now, timeZone)) return 'Ce soir'
    if (at.getTime() - now.getTime() < 7 * DAY_MS) return 'Cette semaine'
  }
  const sameYear = at.getFullYear() === now.getFullYear()
  const month = new Intl.DateTimeFormat('fr-FR', {
    timeZone,
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(at)
  return month.charAt(0).toUpperCase() + month.slice(1)
}
