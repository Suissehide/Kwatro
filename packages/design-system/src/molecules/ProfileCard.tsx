import { View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { border, colors, radius, shadow } from '../tokens'
import { RatingBadge } from './RatingBadge'
import { XpBar } from './XpBar'

export function ProfileCard({
  pseudo,
  format,
  rating,
  xp,
}: {
  pseudo: string
  format?: string
  rating?: string
  xp: { level: number; name: string; current: number; max: number }
}) {
  return (
    <Raised offset={shadow.card} r={radius.card}>
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          paddingVertical: 16,
          paddingHorizontal: 18,
          gap: 14,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Typography variant="title">{pseudo}</Typography>
          {rating ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {format ? <Typography variant="small">{format}</Typography> : null}
              <RatingBadge value={rating} />
            </View>
          ) : null}
        </View>
        <XpBar {...xp} />
      </View>
    </Raised>
  )
}
