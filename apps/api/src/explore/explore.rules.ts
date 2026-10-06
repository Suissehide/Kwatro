import { PARTNER_TIE_METERS } from '@lucko/shared'

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
