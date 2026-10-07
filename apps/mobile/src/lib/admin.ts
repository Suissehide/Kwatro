import type { SidebarItem } from '@lucko/design-system'
import {
  type AdminDashboard,
  type AdminEvent,
  type AdminEventInput,
  type AdminUser,
  formatTime,
  localDateTime,
  VENUE_TIME_ZONE,
} from '@lucko/shared'
import { type Href, router } from 'expo-router'
import { shortDay } from './explore'

// Back-office admin (LKO-20) : navigation et mise en forme des données pour les écrans /admin.

export type AdminSection = 'dashboard' | 'reports' | 'users' | 'avatars' | 'venues' | 'games'

const ROUTES: Record<AdminSection, Href> = {
  dashboard: '/admin',
  reports: '/admin/reports',
  users: '/admin/users',
  avatars: '/admin/avatars',
  venues: '/admin/venues',
  games: '/admin/games',
}

export const openAdmin = (section: string) => router.navigate(ROUTES[section as AdminSection])

export const openAdminUser = (id: string) =>
  router.push({ pathname: '/admin/users/[id]', params: { id } })

export const openAdminVenue = (id: string) =>
  router.push({ pathname: '/admin/venues/[id]', params: { id } })

const badge = (count?: number) => (count ? String(count) : undefined)

/** Barre latérale : une entrée par file, avec ce qui attend. */
export const adminSidebarItems = (dashboard?: AdminDashboard): SidebarItem[] => [
  { key: 'dashboard', label: 'Tableau de bord' },
  { key: 'reports', label: 'Signalements', badge: badge(dashboard?.openReports) },
  { key: 'users', label: 'Joueurs', badge: badge(dashboard?.suspendedPlayers) },
  { key: 'avatars', label: 'Photos de profil', badge: badge(dashboard?.pendingAvatars) },
  { key: 'venues', label: 'Lieux et événements', badge: badge(dashboard?.pendingVenues) },
  { key: 'games', label: 'Jeux' },
]

export const ADMIN_TITLES: Record<AdminSection, string> = {
  dashboard: 'Back-office',
  reports: 'Signalements',
  users: 'Joueurs',
  avatars: 'Photos de profil',
  venues: 'Lieux et événements',
  games: 'Jeux',
}

/** « Sam. 10 oct. · 19:30 » */
export const dateTime = (date: string) => `${shortDay(date)} · ${formatTime(date)}`

/** « Suspendu jusqu'au 13 oct. », « Suspendu définitivement ». */
export const suspensionLabel = (suspension: NonNullable<AdminUser['suspension']>) =>
  suspension.until ? `Suspendu jusqu’au ${shortDay(suspension.until)}` : 'Suspendu définitivement'

/** Durées proposées pour une suspension ; `null` = définitive. */
export const SUSPENSION_DURATIONS: { key: string; label: string; days: number | null }[] = [
  { key: '1', label: '1 jour', days: 1 },
  { key: '7', label: '7 jours', days: 7 },
  { key: '30', label: '30 jours', days: 30 },
  { key: 'definitive', label: 'Définitive', days: null },
]

export const suspensionDays = (key: string) =>
  SUSPENSION_DURATIONS.find((d) => d.key === key)?.days ?? null

// * ÉVÉNEMENTS

/** Formulaire d'événement : champs texte, convertis en nombres à l'envoi. */
export type EventFormValues = Omit<
  AdminEventInput,
  'capacity' | 'priceCents' | 'minAge' | 'repeatWeeks' | 'endTime' | 'description' | 'externalUrl'
> & {
  description: string
  endTime: string
  capacity: string
  price: string
  minAge: string
  externalUrl: string
  repeatWeeks: string
}

/** Date et heure locales (heure du lieu) d'un instant ISO, pour préremplir un formulaire. */
export const localParts = (date: string) => {
  const { date: day, minute } = localDateTime(new Date(date), VENUE_TIME_ZONE)
  const pad = (n: number) => String(n).padStart(2, '0')
  return { day, time: `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}` }
}

export function eventFormValues(event?: AdminEvent): EventFormValues {
  if (!event)
    return {
      type: 'GAME_NIGHT',
      title: '',
      description: '',
      date: localDateTime(new Date()).date,
      startTime: '19:00',
      endTime: '',
      capacity: '',
      price: '',
      minAge: '',
      registrationMode: 'IN_APP',
      externalUrl: '',
      gameIds: [],
      repeatWeeks: '0',
    }
  const start = localParts(event.startsAt)
  return {
    type: event.type,
    title: event.title,
    description: event.description ?? '',
    date: start.day,
    startTime: start.time,
    endTime: event.endsAt ? localParts(event.endsAt).time : '',
    capacity: event.capacity?.toString() ?? '',
    price: event.priceCents === null ? '' : String(event.priceCents / 100),
    minAge: event.minAge?.toString() ?? '',
    registrationMode: event.registrationMode,
    externalUrl: event.externalUrl ?? '',
    gameIds: event.gameIds,
    repeatWeeks: '0',
  }
}

const numberOrNull = (text: string) => (text.trim() ? Number(text.replace(',', '.')) : null)
const textOrNull = (text: string) => text.trim() || null

/** Corps du POST / PUT : champs vides → null, prix en centimes. */
export function eventBody({ price: priceText, ...values }: EventFormValues): AdminEventInput {
  const price = numberOrNull(priceText)
  return {
    ...values,
    description: textOrNull(values.description),
    endTime: textOrNull(values.endTime),
    externalUrl: textOrNull(values.externalUrl),
    capacity: numberOrNull(values.capacity),
    priceCents: price === null ? null : Math.round(price * 100),
    minAge: numberOrNull(values.minAge),
    repeatWeeks: Number(values.repeatWeeks) || 0,
  }
}
