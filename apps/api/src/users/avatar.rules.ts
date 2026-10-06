import type { AvatarStatus } from '@lucko/shared'

/** Modèles Sightengine demandés : 1 opération chacun, soit 3 par photo. */
export const SIGHTENGINE_MODELS = 'nudity-2.1,gore-2.0,offensive-2.0'

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

/** Format réel lu dans les premiers octets (le type annoncé par le client ne compte pas) ; null sinon. */
export function imageType(file: Uint8Array) {
  const ascii = (from: number, to: number) => String.fromCharCode(...file.subarray(from, to))
  if (file[0] === 0xff && file[1] === 0xd8 && file[2] === 0xff)
    return { mime: 'image/jpeg', ext: 'jpg' }
  if (file[0] === 0x89 && ascii(1, 4) === 'PNG') return { mime: 'image/png', ext: 'png' }
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { mime: 'image/webp', ext: 'webp' }
  return null
}

/** Réponse de check.json, réduite aux scores utilisés (0 à 1). */
export type ImageScores = {
  nudity: {
    sexual_activity: number
    sexual_display: number
    erotica: number
    very_suggestive: number
  }
  gore: { prob: number }
  offensive: {
    nazi: number
    asian_swastika: number
    supremacist: number
    terrorist: number
    confederate: number
    middle_finger: number
  }
}

// ponytail: seuils à régler avec les premiers refus et les faux positifs vus dans la file admin
const REJECT_AT = 0.8
const REVIEW_AT = 0.4

/**
 * Refusée d'office si la photo est sûrement explicite, sanglante ou haineuse ; en attente d'un admin
 * au moindre doute ; validée sinon. `null` (analyse indisponible) : en attente.
 */
export function avatarVerdict(scores: ImageScores | null): AvatarStatus {
  if (!scores) return 'PENDING'
  const { nudity, gore, offensive } = scores
  const { middle_finger, ...hate } = offensive
  const unsafe = Math.max(
    nudity.sexual_activity,
    nudity.sexual_display,
    nudity.erotica,
    gore.prob,
    ...Object.values(hate),
  )
  if (unsafe >= REJECT_AT) return 'REJECTED'
  return Math.max(unsafe, nudity.very_suggestive, middle_finger) >= REVIEW_AT
    ? 'PENDING'
    : 'APPROVED'
}
