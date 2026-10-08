import { Text, View } from 'react-native'
import { border, colors, font, radius } from '../tokens'

/** Pastille de compteur ; `light` = fond blanc, sur un bouton foncé (filtre actif). */
export function CountBadge({ count, light }: { count: number; light?: boolean }) {
  return (
    <View
      style={{
        minWidth: 20,
        height: 20,
        borderRadius: radius.pill,
        backgroundColor: light ? colors.white : colors.room,
        borderWidth: border.thin,
        borderColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
      }}
    >
      <Text
        style={{ ...font('mono', 700), fontSize: 11, color: light ? colors.ink : colors.white }}
      >
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  )
}
