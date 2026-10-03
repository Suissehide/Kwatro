import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useHover } from '../atoms/useHover'
import { border, colors, font, sizes, transition } from '../tokens'

/**
 * Ligne de liste. Avec `onPress` : cliquable, fond crème clair au survol.
 * `inset` : marge horizontale quand la ligne remplit une carte (le survol va alors jusqu'aux bords).
 */
export function ListRow({
  left,
  title,
  subtitle,
  note,
  right,
  last,
  inset = 0,
  onPress,
}: {
  left?: ReactNode
  title: string
  subtitle?: string
  /** Troisième ligne mise en avant (vert lieu), ex. l'avantage Kwatro d'un partenaire. */
  note?: string
  right?: ReactNode
  last?: boolean
  inset?: number
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      role={onPress ? 'button' : undefined}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: sizes.rowComfort,
        paddingVertical: 10,
        paddingHorizontal: inset,
        borderBottomWidth: last ? 0 : border.thin,
        borderColor: colors.line,
        backgroundColor: onPress && hovered ? colors.hover : 'transparent',
        ...transition(['background-color']),
      }}
    >
      {left}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text numberOfLines={1} style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{ ...font('body', 400), fontSize: 13, color: colors.muted }}
          >
            {subtitle}
          </Text>
        ) : null}
        {note ? (
          <Text style={{ ...font('body', 600), fontSize: 13, lineHeight: 18, color: colors.venue }}>
            {note}
          </Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  )
}
