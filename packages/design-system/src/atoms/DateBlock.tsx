import { Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

export function DateBlock({
  day,
  month,
  color = colors.event,
}: {
  day: string
  month: string
  color?: string
}) {
  return (
    <View
      aria-label={`${day} ${month}`}
      style={{
        width: 46,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: colors.white,
      }}
    >
      <Text
        style={{
          ...font('mono', 700),
          backgroundColor: color,
          color: colors.white,
          fontSize: 10,
          textAlign: 'center',
          paddingVertical: 2,
          borderBottomWidth: border.thin,
          borderColor: colors.ink,
        }}
      >
        {month}
      </Text>
      <Text
        style={{
          ...font('display'),
          fontSize: 18,
          textAlign: 'center',
          paddingVertical: 3,
          color: colors.ink,
        }}
      >
        {day}
      </Text>
    </View>
  )
}
