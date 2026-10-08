import { ageOn, MIN_AGE } from '@lucko/shared'

/** Joueur qui consulte une liste ; null = pas connecté (site public). */
export type Viewer = { id: string; birthDate: Date | null; parentId: string | null } | null

const ADULT_AGE = 18
/** Art. L3342-3 CSP : pas de moins de 16 ans non accompagnés dans un débit de boissons. */
const UNACCOMPANIED_AGE = 16

/**
 * Âge retenu pour les règles mineurs (archi §3). Sans date de naissance (première connexion
 * Apple / Google pas terminée), on prend l'âge minimum : le régime le plus protecteur.
 */
export function viewerAge(viewer: NonNullable<Viewer>, now = new Date()) {
  return viewer.birthDate ? ageOn(viewer.birthDate, now) : MIN_AGE
}

export const isMinor = (viewer: Viewer, now = new Date()) =>
  viewer !== null && viewerAge(viewer, now) < ADULT_AGE

/** Lieu qui refuse le joueur s'il vient seul : moins de 16 ans dans un lieu sans « mineurs non accompagnés ». */
export const venueRefuses = (
  venue: { acceptsUnaccompaniedMinors: boolean } | null,
  viewer: Viewer,
  now = new Date(),
) =>
  viewer !== null &&
  venue?.acceptsUnaccompaniedMinors === false &&
  viewerAge(viewer, now) < UNACCOMPANIED_AGE

/**
 * Room visible par un mineur : seulement « ouverte aux mineurs », jamais à domicile, ni dans un lieu
 * qui refuse les moins de 16 ans seuls (LKO-51), sauf la room de son parent lié (décision du 25/09).
 */
export function roomVisibleTo(
  room: {
    minorsAllowed: boolean
    atHome: boolean
    hostId: string
    venue: { acceptsUnaccompaniedMinors: boolean } | null
  },
  viewer: Viewer,
  now = new Date(),
) {
  if (!isMinor(viewer, now)) return true
  // Room de son parent : il vient accompagné
  const parentHosts = viewer?.parentId != null && room.hostId === viewer.parentId
  if (room.atHome) return parentHosts
  if (!parentHosts && venueRefuses(room.venue, viewer, now)) return false
  return room.minorsAllowed
}

/** Événement visible : pas d'âge minimum, ou le joueur l'a (soirées 18+ jamais montrées aux mineurs). */
export function eventVisibleTo(event: { minAge: number | null }, viewer: Viewer, now = new Date()) {
  return viewer === null || event.minAge === null || viewerAge(viewer, now) >= event.minAge
}
