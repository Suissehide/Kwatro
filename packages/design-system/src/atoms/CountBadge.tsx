import { Text, View } from 'react-native'
import { border, colors, font, radius } from '../tokens'

export function CountBadge({ count }: { count: number }) {
  return (
    <View
      style={{
        minWidth: 20,
        height: 20,
        borderRadius: radius.pill,
        backgroundColor: colors.room,
        borderWidth: border.thin,
        borderColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
      }}
    >
      <Text style={{ ...font('mono', 700), fontSize: 11, color: colors.white }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  )
}
