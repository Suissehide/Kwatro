import type { CreateRoomInput, RoomMode } from '@kwatro/shared'
import { formOptions } from '@tanstack/react-form'

/** Créer une room (C1-C3). Jour et heure séparés : pastilles des 14 prochains jours + heure saisie. */
export type RoomFormValues = {
  gameId: string
  formatId: string
  mode: RoomMode
  venueId: string
  /** Jour local « 2026-10-06 ». */
  day: string
  /** « 20:30 ». */
  time: string
  capacity: number
  minorsAllowed: boolean
  autoAccept: boolean
  description: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const ROOM_DAYS = 14

/** Pastilles des jours : « Aujourd'hui », « Demain », puis « mer. 8 ». */
export function dayOptions(now = new Date()) {
  return Array.from({ length: ROOM_DAYS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    const label =
      i === 0
        ? 'Aujourd’hui'
        : i === 1
          ? 'Demain'
          : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
    return { key: localDate(d), label }
  })
}

export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export const roomDefaults = (venueId = ''): RoomFormValues => ({
  gameId: '',
  formatId: '',
  mode: 'CASUAL',
  venueId,
  day: localDate(new Date()),
  time: '20:00',
  capacity: 4,
  minorsAllowed: false,
  autoAccept: false,
  description: '',
})

export const roomFormOpts = formOptions({ defaultValues: roomDefaults() })

/** Corps du POST /rooms : jour + heure à l'heure du téléphone, champs vides retirés. */
export const roomBody = ({ day, time, formatId, description, ...rest }: RoomFormValues) =>
  ({
    ...rest,
    formatId: formatId || null,
    startsAt: new Date(`${day}T${time}:00`).toISOString(),
    description: description.trim() || undefined,
  }) satisfies CreateRoomInput
