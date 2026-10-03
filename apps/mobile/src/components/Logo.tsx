import { colors } from '@kwatro/design-system'
import { View } from 'react-native'

/** Logo Kwatro, comme le favicon du site (apps/web/src/app/icon.svg) : carré jaune, quatre points. */
export function Logo({ size = 32 }: { size?: number }) {
  const dot = size * 0.19
  return (
    <View
      aria-hidden
      style={{
        width: size,
        height: size,
        backgroundColor: colors.kwote,
        borderWidth: Math.max(2, size * 0.08),
        borderColor: colors.ink,
        borderRadius: size * 0.2,
        padding: size * 0.14,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'space-between',
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{ width: dot, height: dot, borderRadius: dot, backgroundColor: colors.ink }}
        />
      ))}
    </View>
  )
}
