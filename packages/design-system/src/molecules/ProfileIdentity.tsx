import { View } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { Chip } from '../atoms/Chip'
import { Raised } from '../atoms/Raised'
import { TextLink } from '../atoms/TextLink'
import { Typography } from '../atoms/Typography'
import { border, colors, radius, shadow } from '../tokens'
import { XpBar } from './XpBar'

type Xp = { level: number; name: string; current: number; max: number }

/**
 * Identité du joueur en tête de son profil : avatar, pseudo, ville, ambiances.
 * Web : grand titre et lien « Modifier le profil ». Téléphone : carte relevée avec la barre d'XP.
 */
export function ProfileIdentity({
  pseudo,
  avatarUri,
  place,
  vibes,
  xp,
  wide,
  onEdit,
}: {
  pseudo: string
  /** Photo validée seulement : sinon l'initiale. */
  avatarUri?: string | null
  /** « Bordeaux · rayon 10 km » ; null si la ville n'est pas renseignée. */
  place: string | null
  vibes: string[]
  xp: Xp
  wide?: boolean
  onEdit?: () => void
}) {
  const chips = vibes.length ? (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      {vibes.map((vibe) => (
        <Chip key={vibe} label={vibe} active color={colors.ratingSoft} />
      ))}
      {wide && onEdit ? <TextLink label="Modifier le profil" onPress={onEdit} /> : null}
    </View>
  ) : wide && onEdit ? (
    <View style={{ alignSelf: 'flex-start' }}>
      <TextLink label="Modifier le profil" onPress={onEdit} />
    </View>
  ) : null

  if (wide) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
        <Raised offset={shadow.card} r={64}>
          <Avatar name={pseudo} uri={avatarUri} size={128} />
        </Raised>
        <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
          {place ? <Typography variant="label">{place}</Typography> : null}
          <Typography variant="hero" numberOfLines={1}>
            {pseudo}
          </Typography>
          {chips}
        </View>
      </View>
    )
  }

  return (
    <Raised offset={shadow.card} r={radius.card}>
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          padding: 16,
          gap: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={pseudo} uri={avatarUri} size={72} />
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Typography variant="h1">{pseudo}</Typography>
            {place ? <Typography variant="small">{place}</Typography> : null}
          </View>
        </View>
        <XpBar {...xp} />
        {chips}
      </View>
    </Raised>
  )
}
