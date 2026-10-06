import { type Me, type PlayVibe, RADIUS_KM } from '@lucko/shared'
import { formOptions } from '@tanstack/react-form'
import { type CityValue, cityFields, cityValue } from '@/lib/city'

/** Formulaire du profil, partagé par Modifier le profil et l'onboarding (qui n'en montre qu'une partie). */
export type ProfileFormValues = {
  pseudo: string
  name: string
  city: CityValue
  searchRadiusKm: number
  availability: number[]
  vibes: PlayVibe[]
}

export const profileDefaults = (me: Me | null): ProfileFormValues => ({
  pseudo: me?.pseudo ?? '',
  name: me?.name ?? '',
  city: me ? cityValue(me) : { name: '', lat: null, lng: null },
  searchRadiusKm: me?.searchRadiusKm ?? RADIUS_KM.default,
  availability: me?.availability ?? [],
  vibes: me?.vibes ?? [],
})

export const profileFormOpts = formOptions({ defaultValues: profileDefaults(null) })

/** Corps du PATCH /me : pseudo nettoyé, ville vérifiée par le géocodage. */
export const profileBody = async ({ city, pseudo, ...rest }: ProfileFormValues) => ({
  ...rest,
  pseudo: pseudo.trim(),
  ...(await cityFields(city)),
})
