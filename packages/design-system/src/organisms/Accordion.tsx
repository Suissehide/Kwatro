import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { border, colors, font, radius } from '../tokens'

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      {items.map((it, i) => {
        const expanded = open === i
        return (
          <Pressable
            key={it.q}
            role="button"
            aria-expanded={expanded}
            onPress={() => setOpen(expanded ? null : i)}
            style={{
              padding: 14,
              gap: 8,
              backgroundColor: expanded ? colors.kwoteSoft : colors.white,
              borderTopWidth: i ? border.thin : 0,
              borderColor: colors.line,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <Text style={{ flex: 1, ...font('body', 800), fontSize: 14, color: colors.ink }}>
                {it.q}
              </Text>
              <Text style={{ ...font('body', 800), color: colors.ink }}>
                {expanded ? '−' : '+'}
              </Text>
            </View>
            {expanded ? (
              <Text
                style={{ ...font('body', 400), fontSize: 13, lineHeight: 19, color: colors.muted }}
              >
                {it.a}
              </Text>
            ) : null}
          </Pressable>
        )
      })}
    </View>
  )
}
