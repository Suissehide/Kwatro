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
