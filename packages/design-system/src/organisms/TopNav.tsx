import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { Brand } from '../molecules/Brand'
import { border, colors, font, motion, radius, shadow, sizes, textOn, transition } from '../tokens'

export type TopNavItem = { key: string; label: string }

export function TopNav({
  items = [],
  active,
  onSelect,
  color = colors.room,
  right,
  onHome,
  avatar,
  onAvatar,
}: {
  items?: TopNavItem[]
  active?: string
  onSelect?: (key: string) => void
  color?: string
  right?: ReactNode
  onHome?: () => void
  avatar?: string
  onAvatar?: () => void
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
        <View role="navigation" style={{ flexDirection: 'row', gap: 8, marginLeft: 40 }}>
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
      {avatar !== undefined ? <AvatarLink name={avatar || '?'} onPress={onAvatar} /> : null}
    </View>
  )
}

function AvatarLink({ name, onPress }: { name: string; onPress?: () => void }) {
  const { hovered, hoverProps } = useHover()
  const size = sizes.avatar.s
  const lift = hovered ? 2 : 0
  const move = transition(['transform'], motion.fast)
  return (
    <Pressable
      role="link"
      aria-label="Ton profil"
      onPress={onPress}
      {...hoverProps}
      style={{ marginLeft: 8, borderRadius: size / 2 }}
    >
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.ink,
          transform: [{ translateX: lift }, { translateY: lift }],
          ...move,
        }}
      />
      <View style={{ transform: [{ translateX: -lift / 2 }, { translateY: -lift / 2 }], ...move }}>
        <Avatar name={name} size={size} />
      </View>
    </Pressable>
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
      // L'ombre de la pastille mange l'espace avec le lien suivant
      style={{ borderRadius: radius.field, marginRight: active ? shadow.sm + 6 : 0 }}
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
