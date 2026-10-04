/** Âge minimum pour créer un compte (décision du 25/09/2026). */
export const MIN_AGE = 13

/** Âge de la majorité numérique RGPD en France : consentement parental en dessous. */
export const DIGITAL_MAJORITY_AGE = 15

/** Délai de révélation de l'adresse d'une room à domicile, en heures. */
export const HOME_ADDRESS_REVEAL_HOURS = 24

export const GAME_KINDS = ['TCG', 'BOARD_GAME'] as const
export type GameKind = (typeof GAME_KINDS)[number]

/** Classée : TCG uniquement, la Kwote bouge. Normale : aucun effet sur la Kwote, XP seulement. */
export const ROOM_MODES = ['RANKED', 'CASUAL'] as const
export type RoomMode = (typeof ROOM_MODES)[number]

/** Rôle global d'un compte (identique à l'enum Prisma UserRole). Les rôles par lieu sont dans VenueStaff. */
export const USER_ROLES = ['PLAYER', 'VENUE_STAFF', 'ADMIN'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const VENUE_TYPES = ['GAME_BAR', 'TCG_SHOP', 'LUDOTHEQUE', 'ASSOCIATION', 'OTHER'] as const
export type VenueType = (typeof VENUE_TYPES)[number]

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  GAME_BAR: 'Bar à jeux',
  TCG_SHOP: 'Boutique TCG',
  LUDOTHEQUE: 'Ludothèque',
  ASSOCIATION: 'Association',
  OTHER: 'Lieu',
}

export const EVENT_TYPES = [
  'GAME_NIGHT',
  'INITIATION',
  'TOURNAMENT',
  'PRERELEASE',
  'THEMED',
] as const
export type EventType = (typeof EVENT_TYPES)[number]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  GAME_NIGHT: 'Soirée jeux',
  INITIATION: 'Initiation',
  TOURNAMENT: 'Tournoi',
  PRERELEASE: 'Avant-première',
  THEMED: 'Soirée à thème',
}

/** Entrée libre, inscription dans l'app, ou sur un site externe (identique à l'enum Prisma). */
export const REGISTRATION_MODES = ['NONE', 'IN_APP', 'EXTERNAL'] as const
export type RegistrationMode = (typeof REGISTRATION_MODES)[number]

/** Inscription active à un événement (l'enum Prisma a aussi CANCELLED, jamais renvoyé à l'app). */
export const REGISTRATION_STATUSES = ['REGISTERED', 'WAITLISTED'] as const
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

/** Fuseau de référence des lieux (Bordeaux au lancement). */
export const VENUE_TIME_ZONE = 'Europe/Paris'

/** Centre par défaut quand la position du joueur est inconnue ou refusée. */
export const DEFAULT_CITY = { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 } as const

/**
 * Tri honnête des lieux : à distance « égale » (même tranche de 250 m), les partenaires passent devant ;
 * au-delà, la distance l'emporte toujours. Valeur à affiner avec l'équipe (question ouverte n° 2).
 */
export const PARTNER_TIE_METERS = 250
