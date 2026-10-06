import { Diamond } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius } from '../tokens'

/** LK : force par format TCG. Toujours jaune + losange, chiffres en Space Mono. */
export function RatingBadge({
  value,
  reliability,
  large,
}: {
  value: string
  reliability?: number
  large?: boolean
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View
        aria-label={`LK ${value}`}
        style={{
          backgroundColor: colors.rating,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: radius.pill,
          flexDirection: 'row',
          alignItems: 'center',
          gap: large ? 6 : 4,
          paddingVertical: large ? 4 : 2,
          paddingHorizontal: large ? 12 : 8,
        }}
      >
        <Diamond size={large ? 13 : 10} color={colors.ink} fill={colors.ink} />
        <Text style={{ ...font('mono', 700), fontSize: large ? 16 : 12, color: colors.ink }}>
          {value}
        </Text>
      </View>
      {reliability != null ? (
        <Typography variant="small">fiabilité {reliability} %</Typography>
      ) : null}
    </View>
  )
}
