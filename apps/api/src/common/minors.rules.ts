import { ageOn, MIN_AGE } from '@kwatro/shared'

/** Joueur qui consulte une liste ; null = pas connecté (site public). */
export type Viewer = { id: string; birthDate: Date | null; parentId: string | null } | null

const ADULT_AGE = 18

/**
 * Âge retenu pour les règles mineurs (archi §3). Sans date de naissance (première connexion
 * Apple / Google pas terminée), on prend l'âge minimum : le régime le plus protecteur.
 */
export function viewerAge(viewer: NonNullable<Viewer>, now = new Date()) {
  return viewer.birthDate ? ageOn(viewer.birthDate, now) : MIN_AGE
}

export const isMinor = (viewer: Viewer, now = new Date()) =>
  viewer !== null && viewerAge(viewer, now) < ADULT_AGE

/**
 * Room visible par un mineur : seulement « ouverte aux mineurs », et jamais à domicile,
 * sauf la room de son parent lié (décision du 25/09).
 */
export function roomVisibleTo(
  room: { minorsAllowed: boolean; atHome: boolean; hostId: string },
  viewer: Viewer,
  now = new Date(),
) {
  if (!isMinor(viewer, now)) return true
  if (room.atHome) return viewer?.parentId != null && room.hostId === viewer.parentId
  return room.minorsAllowed
}

/** Événement visible : pas d'âge minimum, ou le joueur l'a (soirées 18+ jamais montrées aux mineurs). */
export function eventVisibleTo(event: { minAge: number | null }, viewer: Viewer, now = new Date()) {
  return viewer === null || event.minAge === null || viewerAge(viewer, now) >= event.minAge
}
