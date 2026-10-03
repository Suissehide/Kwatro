import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useHover } from '../atoms/useHover'
import { Brand } from '../molecules/Brand'
import { border, colors, font, radius, transition } from '../tokens'

export type TopNavItem = { key: string; label: string }

/**
 * Barre du site sur desktop : logo + Kwatro, liens vers les pages (la page active est soulignée)
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
  /** Soulignement de la page active (rouge room côté joueur, vert lieu côté espace lieu). */
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
      <Brand />
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
  return (
    <Pressable
      role="link"
      aria-current={active ? 'page' : undefined}
      onPress={onPress}
      {...hoverProps}
      style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.tag }}
    >
      <Text style={{ ...font('body', active ? 800 : 600), fontSize: 14, color: colors.ink }}>
        {label}
      </Text>
      {/* Soulignement : plein et à la couleur du joueur sur la page active, qui se déroule au survol */}
      <View
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 2,
          height: border.base,
          borderRadius: border.base,
          backgroundColor: active ? color : colors.ink,
          transform: [{ scaleX: active || hovered ? 1 : 0 }],
          ...transition(['transform']),
        }}
      />
    </Pressable>
  )
}
