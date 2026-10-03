import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { Brand } from '../molecules/Brand'
import { border, colors, font, motion, radius, shadow, textOn, transition } from '../tokens'

export type TopNavItem = { key: string; label: string }

/**
 * Barre du site sur desktop : logo + Kwatro, liens vers les pages (page active en pastille relevée,
 * les autres soulignées au survol) et actions à droite. Sans `items`, simple barre de marque (écran de connexion).
 */
export function TopNav({
  items = [],
  active,
  onSelect,
  color = colors.room,
  right,
  onHome,
}: {
  items?: TopNavItem[]
  active?: string
  onSelect?: (key: string) => void
  /** Fond de la page active (rouge room côté joueur, vert lieu côté espace lieu). */
  color?: string
  right?: ReactNode
  /** Clic sur la marque : retour à l'accueil. */
  onHome?: () => void
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderBottomWidth: border.base,
        borderColor: colors.ink,
      }}
    >
      <Brand onPress={onHome} />
      {items.length ? (
        <View role="navigation" style={{ flexDirection: 'row', gap: 6, marginLeft: 40 }}>
          {items.map((item) => (
            <NavLink
              key={item.key}
              label={item.label}
              active={item.key === active}
              color={color}
              onPress={() => onSelect?.(item.key)}
            />
          ))}
        </View>
      ) : null}
      <View style={{ flex: 1 }} />
      {right}
    </View>
  )
}

function NavLink({
  label,
  active,
  color,
  onPress,
}: {
  label: string
  active: boolean
  color: string
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const pill = (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: radius.field,
        borderWidth: border.thin,
        borderColor: active ? colors.ink : 'transparent',
        backgroundColor: active ? color : 'transparent',
        // Page active : pastille relevée qui se soulève d'1 px au survol, comme un bouton
        transform: active && hovered ? [{ translateX: -1 }, { translateY: -1 }] : [],
        ...transition(['transform'], motion.fast),
      }}
    >
      <Text
        style={{
          ...font('body', active ? 800 : 600),
          fontSize: 14,
          color: active ? textOn(color) : colors.ink,
        }}
      >
        {label}
      </Text>
      {active ? null : (
        // Autres pages : soulignement qui se déroule au survol
        <View
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 2,
            height: border.base,
            borderRadius: border.base,
            backgroundColor: colors.ink,
            transform: [{ scaleX: hovered ? 1 : 0 }],
            ...transition(['transform']),
          }}
        />
      )}
    </View>
  )
  return (
    <Pressable
      role="link"
      aria-current={active ? 'page' : undefined}
      onPress={onPress}
      {...hoverProps}
      style={{ borderRadius: radius.field }}
    >
      {active ? (
        <Raised offset={shadow.sm} r={radius.field}>
          {pill}
        </Raised>
      ) : (
        pill
      )}
    </Pressable>
  )
}
