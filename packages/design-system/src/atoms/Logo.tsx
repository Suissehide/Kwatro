import { View } from 'react-native'
import { colors } from '../tokens'

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
        justifyContent: 'space-between',
      }}
    >
      {/* Deux rangées explicites : avec flexWrap, l'arrondi des tailles en 28 px mettait 3 points par ligne */}
      {[0, 1].map((row) => (
        <View key={row} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={{ width: dot, height: dot, borderRadius: dot, backgroundColor: colors.ink }}
            />
          ))}
        </View>
      ))}
    </View>
  )
}
