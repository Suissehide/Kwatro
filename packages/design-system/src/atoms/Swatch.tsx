import { Text, View } from 'react-native'
import { colors, font } from '../tokens'

/** Carré de couleur suivi d'un libellé (type d'action dans un journal). */
export function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 0,
        alignSelf: 'stretch',
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          backgroundColor: color,
          borderWidth: 1.5,
          borderColor: colors.ink,
        }}
      />
      <Text
        numberOfLines={1}
        style={{ flexShrink: 1, ...font('body', 800), fontSize: 14, color: colors.ink }}
      >
        {label}
      </Text>
    </View>
  )
}
