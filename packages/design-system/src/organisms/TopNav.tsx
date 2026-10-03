import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Logo } from '../atoms/Logo'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, textOn } from '../tokens'

export type TopNavItem = { key: string; label: string }

/**
 * Barre du site sur desktop : logo + Kwatro, liens vers les pages (l'actif est une pastille relevée)
 * et actions à droite. Sans `items`, simple barre de marque (écran de connexion).
 */
export function TopNav({
  items = [],
  active,
  onSelect,
  color = colors.room,
  right,
}: {
  items?: TopNavItem[]
  active?: string
  onSelect?: (key: string) => void
  /** Fond du lien actif (rouge room côté joueur, vert lieu côté espace lieu). */
  color?: string
  right?: ReactNode
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
      <Logo size={32} />
      <Text
        style={{ ...font('display'), fontSize: 22, textTransform: 'uppercase', color: colors.ink }}
      >
        Kwatro
      </Text>
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
        borderColor: active || hovered ? colors.ink : 'transparent',
        backgroundColor: active ? color : hovered ? colors.white : 'transparent',
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
