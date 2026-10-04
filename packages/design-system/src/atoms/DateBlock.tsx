import { Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

/** Bloc date : bandeau coloré (`month`, ou le jour de la semaine), chiffre, et `sub` en dessous (mois). */
export function DateBlock({
  day,
  month,
  sub,
  color = colors.event,
}: {
  day: string
  month: string
  sub?: string
  color?: string
}) {
  return (
    <View
      aria-label={[month, day, sub].filter(Boolean).join(' ')}
      style={{
        width: sub ? 50 : 46,
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
          paddingTop: 3,
          paddingBottom: sub ? 0 : 3,
          color: colors.ink,
        }}
      >
        {day}
      </Text>
      {sub ? (
        <Text
          style={{
            ...font('mono', 700),
            fontSize: 9,
            textAlign: 'center',
            paddingBottom: 3,
            color: colors.muted,
          }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  )
}
