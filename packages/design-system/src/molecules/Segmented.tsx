import { Pressable, Text, View } from 'react-native'
import { border, colors, font, radius, textOn } from '../tokens'

/** Segments égaux ; l'actif prend la couleur du contenu (Rooms rouge, Événements bleu…). */
export function Segmented({
  items,
  value,
  onChange,
  color = colors.room,
}: {
  items: string[]
  value: number
  onChange?: (i: number) => void
  color?: string
}) {
  return (
    <View role="tablist" style={{ flexDirection: 'row', gap: 6 }}>
      {items.map((label, i) => {
        const active = i === value
        return (
          <Pressable
            key={label}
            role="tab"
            aria-selected={active}
            onPress={() => onChange?.(i)}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: 'center',
              borderWidth: border.thin,
              borderColor: colors.ink,
              borderRadius: radius.sm,
              backgroundColor: active ? color : colors.white,
            }}
          >
            <Text
              style={{
                ...font('body', active ? 800 : 600),
                fontSize: 13,
                color: active ? textOn(color) : colors.ink,
              }}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
