import { Pressable, Text, View } from 'react-native'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, transition } from '../tokens'

export type Suggestion = { key: string; label: string; detail?: string }

/** Suggestions sous un champ (autocomplétion de la ville) : libellé et détail en mono à droite. */
export function SuggestionList({
  items,
  onSelect,
}: {
  items: Suggestion[]
  onSelect: (item: Suggestion) => void
}) {
  return (
    <View
      role="list"
      style={{
        overflow: 'hidden',
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.button,
        backgroundColor: colors.white,
      }}
    >
      {items.map((item, i) => (
        <Row key={item.key} item={item} first={i === 0} onPress={() => onSelect(item)} />
      ))}
    </View>
  )
}

function Row({ item, first, onPress }: { item: Suggestion; first: boolean; onPress: () => void }) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      role="option"
      aria-label={item.detail ? `${item.label}, ${item.detail}` : item.label}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 44,
        paddingHorizontal: 14,
        borderTopWidth: first ? 0 : border.thin,
        borderColor: colors.line,
        backgroundColor: hovered ? colors.hover : colors.white,
        ...transition(['background-color']),
      }}
    >
      <Text
        numberOfLines={1}
        style={{ flex: 1, ...font('body', 600), fontSize: 15, color: colors.ink }}
      >
        {item.label}
      </Text>
      {item.detail ? (
        <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.muted }}>
          {item.detail}
        </Text>
      ) : null}
    </Pressable>
  )
}
