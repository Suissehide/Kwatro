import { Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { border, colors, font, radius, shadow } from '../tokens'

/** Avantage Lucko d'un lieu partenaire : bandeau vert, étiquette jaune inclinée. */
export function PerkBanner({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <Raised offset={compact ? shadow.md : shadow.card}>
      <View
        style={{
          flexDirection: compact ? 'column' : 'row',
          alignItems: compact ? 'flex-start' : 'center',
          gap: compact ? 8 : 16,
          backgroundColor: colors.venue,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          paddingVertical: compact ? 12 : 16,
          paddingHorizontal: compact ? 14 : 20,
        }}
      >
        <Text
          style={{
            ...font('mono', 700),
            fontSize: compact ? 10 : 11,
            textTransform: 'uppercase',
            color: colors.ink,
            backgroundColor: colors.rating,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: radius.tag,
            paddingVertical: 3,
            paddingHorizontal: 8,
            transform: [{ rotate: '-3deg' }],
          }}
        >
          Avantage Lucko
        </Text>
        <Text
          style={{
            ...font('body', 800),
            flexShrink: 1,
            fontSize: compact ? 15 : 17,
            lineHeight: compact ? 20 : 22,
            color: colors.white,
          }}
        >
          {text}
        </Text>
      </View>
    </Raised>
  )
}
