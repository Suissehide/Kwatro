import { Check } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, transition } from '../tokens'

/** Choix multiple en carte : case, libellé et description. Cochée : fond kwoteSoft relevé. */
export function OptionCard({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description?: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  const { hovered, hoverProps } = useHover()
  const card = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.field,
        backgroundColor: value ? colors.kwoteSoft : hovered ? colors.hover : colors.white,
        ...transition(['background-color']),
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          marginTop: 1,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: 6,
          backgroundColor: value ? colors.kwote : colors.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value ? <Check size={15} color={colors.ink} strokeWidth={3} /> : null}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>{label}</Text>
        {description ? (
          <Text style={{ ...font('body', 400), fontSize: 13, lineHeight: 18, color: colors.muted }}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  )
  return (
    <Pressable
      role="checkbox"
      aria-checked={value}
      aria-label={label}
      onPress={() => onChange(!value)}
      {...hoverProps}
      style={{ flex: 1 }}
    >
      {value ? (
        <Raised offset={shadow.sm} r={radius.field}>
          {card}
        </Raised>
      ) : (
        card
      )}
    </Pressable>
  )
}
