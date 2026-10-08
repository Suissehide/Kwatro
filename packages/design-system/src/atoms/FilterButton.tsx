import { ChevronDown, ChevronUp } from 'lucide-react-native'
import { Pressable, Text } from 'react-native'
import { border, colors, font, radius, transition } from '../tokens'
import { CountBadge } from './CountBadge'
import { useHover } from './useHover'

/** Bouton d'une barre de filtres : foncé quand il filtre, avec le nombre de valeurs choisies. */
export function FilterButton({
  label,
  count = 0,
  active,
  caret,
  small,
  onPress,
}: {
  label: string
  count?: number
  active: boolean
  /** Menu déroulant : flèche vers le bas, ou vers le haut quand il est ouvert. */
  caret?: 'up' | 'down'
  /** 36 px (téléphone) au lieu de 40. */
  small?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const fg = active ? colors.white : colors.ink
  const Caret = caret === 'up' ? ChevronUp : ChevronDown
  return (
    <Pressable
      role="button"
      aria-expanded={caret ? caret === 'up' : undefined}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: small ? 6 : 8,
        minHeight: small ? 36 : 40,
        paddingVertical: small ? 6 : 7,
        paddingHorizontal: 12,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.field,
        backgroundColor: active ? colors.ink : hovered ? colors.hover : colors.white,
        ...transition(['background-color']),
      }}
    >
      <Text style={{ ...font('body', active ? 800 : 600), fontSize: small ? 13 : 14, color: fg }}>
        {label}
      </Text>
      {count > 0 ? <CountBadge light count={count} /> : null}
      {caret ? <Caret size={14} color={fg} strokeWidth={3} /> : null}
    </Pressable>
  )
}
