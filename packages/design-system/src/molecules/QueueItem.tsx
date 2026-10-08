import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, transition } from '../tokens'

/** Carte d'une file (signalement) : liseré coloré, titre, étiquettes, ancienneté, deux lignes. */
export function QueueItem({
  title,
  tags,
  age,
  line,
  meta,
  stripe,
  selected,
  onPress,
}: {
  title: string
  tags?: ReactNode
  age?: string
  line?: string
  meta?: string
  stripe: string
  selected?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const card = (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        backgroundColor: selected ? colors.ratingSoft : hovered ? colors.hover : colors.white,
        overflow: 'hidden',
        ...transition(['background-color']),
      }}
    >
      <View
        style={{
          width: 8,
          backgroundColor: stripe,
          borderRightWidth: border.thin,
          borderColor: colors.ink,
        }}
      />
      <View style={{ flex: 1, minWidth: 0, paddingVertical: 10, paddingHorizontal: 12, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            numberOfLines={1}
            style={{ flexShrink: 1, ...font('body', 800), fontSize: 16, color: colors.ink }}
          >
            {title}
          </Text>
          {tags}
          <View style={{ flex: 1 }} />
          {age ? (
            <Text style={{ ...font('mono', 400), fontSize: 12, color: colors.muted }}>{age}</Text>
          ) : null}
        </View>
        {line ? (
          <Text numberOfLines={1} style={{ ...font('body', 600), fontSize: 13, color: colors.ink }}>
            {line}
          </Text>
        ) : null}
        {meta ? (
          <Text
            numberOfLines={1}
            style={{ ...font('body', 400), fontSize: 13, color: colors.muted }}
          >
            {meta}
          </Text>
        ) : null}
      </View>
    </View>
  )
  return (
    <Pressable role="button" aria-pressed={!!selected} onPress={onPress} {...hoverProps}>
      {selected ? (
        <Raised offset={shadow.md} r={radius.card}>
          {card}
        </Raised>
      ) : (
        card
      )}
    </Pressable>
  )
}
