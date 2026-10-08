import { Text, View } from 'react-native'
import { border, colors, font, radius, textOn } from '../tokens'

export function CountBadge({ count, color = colors.room }: { count: number; color?: string }) {
  return (
    <View
      style={{
        minWidth: 20,
        height: 20,
        borderRadius: radius.pill,
        backgroundColor: color,
        borderWidth: border.thin,
        borderColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
      }}
    >
      <Text style={{ ...font('mono', 700), fontSize: 11, color: textOn(color) }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  )
}
