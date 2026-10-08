import { Text, View } from 'react-native'
import { border, colors, font, textOn } from '../tokens'

/** Badge de progression : pastille carrée ou ronde, légèrement tournée ; grisée tant qu'elle n'est pas gagnée. */
export function Badge({
  glyph,
  name,
  description,
  color,
  shape = 'square',
  rotate = 0,
  earned,
  size = 56,
}: {
  /** Lettre ou chiffre affiché (« T », « 10 »). */
  glyph: string
  name: string
  /** Comment le débloquer, lu tant qu'il n'est pas gagné. */
  description?: string
  color: string
  shape?: 'square' | 'round'
  /** Entre -4 et 3 degrés. */
  rotate?: number
  earned: boolean
  size?: number
}) {
  const bg = earned ? color : colors.inactive
  return (
    <View
      role="img"
      aria-label={`${name} : ${earned ? 'gagné' : `à débloquer${description ? ` : ${description}` : ''}`}`}
      style={{
        width: size,
        height: size,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: shape === 'round' ? size / 2 : 8,
        backgroundColor: bg,
        opacity: earned ? 1 : 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: `${rotate}deg` }],
      }}
    >
      <Text
        style={{
          ...font('display'),
          fontSize: Math.round(size * (glyph.length > 1 ? 0.32 : 0.36)),
          color: earned ? textOn(bg) : colors.white,
        }}
      >
        {glyph}
      </Text>
    </View>
  )
}
