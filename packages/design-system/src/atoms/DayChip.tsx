import { Pressable, Text } from 'react-native'
import { border, colors, font, radius, shadow, transition } from '../tokens'
import { Raised } from './Raised'
import { useHover } from './useHover'

/**
 * Jour proposé (« MER. » au-dessus de « 7 »). Choisi : fond room, texte blanc, ombre.
 * `other` : puce « Autre date… », en pointillés tant qu'elle est inactive, libellé en texte.
 */
export function DayChip({
  top,
  label,
  active,
  other,
  open,
  compact,
  onPress,
}: {
  top: string
  label: string
  active: boolean
  other?: boolean
  /** Calendrier ouvert sous la puce « Autre date… ». */
  open?: boolean
  compact?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const fg = active ? colors.white : colors.ink
  const face = (
    <Pressable
      role="button"
      aria-pressed={active}
      aria-label={`${top} ${label}`}
      onPress={onPress}
      {...hoverProps}
      style={{
        minWidth: other ? (compact ? 76 : 96) : compact ? 54 : 64,
        paddingVertical: compact ? 6 : 8,
        paddingHorizontal: compact ? 8 : 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderStyle: other && !active && !open ? 'dashed' : 'solid',
        borderRadius: radius.field,
        backgroundColor: active
          ? colors.room
          : open
            ? colors.ratingSoft
            : hovered
              ? colors.hover
              : colors.white,
        ...transition(['background-color']),
      }}
    >
      <Text
        style={{
          ...font('mono', 700),
          fontSize: compact ? 10 : 11,
          textTransform: 'uppercase',
          color: fg,
        }}
      >
        {top}
      </Text>
      <Text
        style={
          other
            ? { ...font('body', 800), fontSize: compact ? 13 : 14, color: fg }
            : { ...font('display'), fontSize: compact ? 18 : 20, color: fg }
        }
      >
        {label}
      </Text>
    </Pressable>
  )
  return active ? (
    <Raised offset={shadow.sm} r={radius.field}>
      {face}
    </Raised>
  ) : (
    face
  )
}
