import { X } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { border, colors, font, radius, transition } from '../tokens'
import { useHover } from './useHover'

/** Filtre actif sous une barre de filtres : un appui le retire. */
export function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      role="button"
      aria-label={`Retirer le filtre ${label}`}
      onPress={onRemove}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 3,
        paddingLeft: 10,
        paddingRight: 5,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.pill,
        backgroundColor: hovered ? colors.rating : colors.ratingSoft,
        ...transition(['background-color']),
      }}
    >
      <Text style={{ ...font('body', 700), fontSize: 12, color: colors.ink }}>{label}</Text>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: colors.ink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={10} color={colors.white} strokeWidth={3.5} />
      </View>
    </Pressable>
  )
}
