import { Pressable, Text, View } from 'react-native'
import { border, colors, font, sizes, transition } from '../tokens'
import { useHover } from './useHover'

export type Presence = 'present' | 'absent'

/** Pointage d'un joueur : Là / Absent. `null` = pas encore pointé, aucun segment actif. */
export function PresenceToggle({
  value,
  onChange,
  label,
}: {
  value: Presence | null
  onChange?: (v: Presence) => void
  /** Nom du joueur, lu par les lecteurs d'écran. */
  label?: string
}) {
  return (
    <View
      role="radiogroup"
      aria-label={label ? `Présence de ${label}` : 'Présence'}
      style={{
        flexDirection: 'row',
        alignSelf: 'flex-start',
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 9,
        overflow: 'hidden',
      }}
    >
      <Segment
        text="Là"
        active={value === 'present'}
        bg={colors.venue}
        onPress={() => onChange?.('present')}
      />
      <Segment
        text="Absent"
        active={value === 'absent'}
        bg={colors.room}
        divider
        onPress={() => onChange?.('absent')}
      />
    </View>
  )
}

function Segment({
  text,
  active,
  bg,
  divider,
  onPress,
}: {
  text: string
  active: boolean
  bg: string
  divider?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      role="radio"
      aria-checked={active}
      onPress={onPress}
      {...hoverProps}
      style={{
        minWidth: sizes.touch,
        minHeight: 40,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: divider ? border.thin : 0,
        borderColor: colors.ink,
        backgroundColor: active ? bg : hovered ? colors.hover : colors.white,
        ...transition(['background-color']),
      }}
    >
      <Text
        style={{ ...font('body', 800), fontSize: 12, color: active ? colors.white : colors.ink }}
      >
        {text}
      </Text>
    </Pressable>
  )
}
