import { Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

/** Répartition en barre horizontale (le design system exclut les camemberts). */
export function ShareBar({
  label,
  percent,
  color,
}: {
  label: string
  percent: number
  color: string
}) {
  return (
    <View style={{ gap: 3 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ ...font('body', 700), fontSize: 13, color: colors.ink }}>{label}</Text>
        <Text style={{ ...font('mono', 700), fontSize: 13, color: colors.ink }}>{percent} %</Text>
      </View>
      <View
        style={{
          height: 14,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: 99,
          overflow: 'hidden',
          backgroundColor: colors.white,
        }}
      >
        <View
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: color,
            borderRightWidth: border.thin,
            borderColor: colors.ink,
          }}
        />
      </View>
    </View>
  )
}
