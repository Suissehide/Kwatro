import { ArrowLeft } from 'lucide-react-native'
import { Pressable, Text, View, type ViewStyle } from 'react-native'
import { Raised } from '../atoms/Raised'
import { TextLink } from '../atoms/TextLink'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, transition } from '../tokens'

// Propriété CSS passée telle quelle par react-native-web
const sticky = { position: 'sticky', top: 24 } as unknown as ViewStyle

/** Navigation des sections de réglages (web) : lien retour puis une entrée par section, collée en haut. */
export function SettingsNav({
  back,
  onBack,
  items,
  active,
  onSelect,
}: {
  back: string
  onBack: () => void
  items: string[]
  active: number
  onSelect: (index: number) => void
}) {
  return (
    <View role="navigation" style={[{ width: 220, gap: 6 }, sticky]}>
      <View style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
        <TextLink icon={ArrowLeft} label={back} onPress={onBack} />
      </View>
      {items.map((label, i) => (
        <SettingsNavItem
          key={label}
          label={label}
          active={i === active}
          onPress={() => onSelect(i)}
        />
      ))}
    </View>
  )
}

function SettingsNavItem({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      role="link"
      aria-current={active ? 'location' : undefined}
      onPress={onPress}
      {...hoverProps}
      style={{ borderRadius: radius.field }}
    >
      <Raised offset={shadow.sm} r={radius.field} color={active ? colors.ink : 'transparent'}>
        <View
          style={{
            paddingVertical: 9,
            paddingHorizontal: 12,
            borderRadius: radius.field,
            borderWidth: border.thin,
            borderColor: active ? colors.ink : 'transparent',
            backgroundColor: active ? colors.white : hovered ? colors.hover : 'transparent',
            ...transition(['background-color']),
          }}
        >
          <Text style={{ ...font('body', active ? 800 : 600), fontSize: 14, color: colors.ink }}>
            {label}
          </Text>
        </View>
      </Raised>
    </Pressable>
  )
}
