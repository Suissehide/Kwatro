import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Logo } from '../atoms/Logo'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, grid, radius, shadow, textOn, transition } from '../tokens'

export type SidebarItem = {
  key: string
  label: string
  /** Pastille de compteur (ex. « 3 »). */
  badge?: string
  /** Fonctionnalité prévue plus tard : grisée, non cliquable. */
  later?: boolean
  /** Titre de groupe affiché avant l'entrée. */
  group?: string
  /** Pastille rouge : file urgente. */
  alert?: boolean
}

/** Barre latérale web 240 px (espace lieu, admin) ; `dark` : fond ink (back-office). */
export function Sidebar({
  title,
  items,
  active,
  onSelect,
  color = colors.venue,
  dark,
  footer,
}: {
  title: string
  items: SidebarItem[]
  active: string
  onSelect: (key: string) => void
  color?: string
  dark?: boolean
  footer?: ReactNode
}) {
  return (
    <View
      role="navigation"
      style={{
        width: dark ? 248 : grid.sidebar,
        backgroundColor: dark ? colors.ink : colors.white,
        borderRightWidth: dark ? 0 : border.base,
        borderColor: colors.ink,
        paddingTop: dark ? 22 : 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
        gap: dark ? 4 : 6,
      }}
    >
      {dark ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6 }}>
          <Raised offset={shadow.sm} r={6} color={colors.rating}>
            <Logo size={30} />
          </Raised>
          <View style={{ gap: 1 }}>
            <Text
              style={{
                ...font('display'),
                fontSize: 19,
                lineHeight: 20,
                textTransform: 'uppercase',
                color: colors.white,
              }}
            >
              Lucko
            </Text>
            <Text
              style={{
                ...font('mono', 700),
                fontSize: 10,
                letterSpacing: 0.44,
                textTransform: 'uppercase',
                color: colors.rating,
              }}
            >
              {title}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <Text
            style={{
              ...font('display'),
              fontSize: 20,
              textTransform: 'uppercase',
              color: colors.ink,
            }}
          >
            Lucko
          </Text>
          <Typography variant="label" style={{ marginBottom: 14 }}>
            {title}
          </Typography>
        </>
      )}
      {dark ? <View style={{ height: 20 }} /> : null}
      {items.map((it) => (
        <View key={it.key}>
          {it.group ? (
            <Text
              style={{
                ...font('mono', 700),
                fontSize: 10,
                letterSpacing: 0.44,
                textTransform: 'uppercase',
                color: dark ? colors.inkMuted : colors.muted,
                marginTop: 14,
                marginHorizontal: 8,
                marginBottom: 4,
              }}
            >
              {it.group}
            </Text>
          ) : null}
          <SidebarLink
            item={it}
            active={it.key === active}
            color={dark ? colors.cream : color}
            dark={dark}
            onPress={() => onSelect(it.key)}
          />
        </View>
      ))}
      <View style={{ flex: 1 }} />
      {footer ? (
        <View
          style={
            dark
              ? { borderTopWidth: border.thin, borderColor: colors.inkLine, paddingTop: 14 }
              : null
          }
        >
          {footer}
        </View>
      ) : null}
    </View>
  )
}

function SidebarLink({
  item: it,
  active: on,
  color,
  dark,
  onPress,
}: {
  item: SidebarItem
  active: boolean
  color: string
  dark?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const row = (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: dark ? 9 : 10,
        paddingHorizontal: dark ? 10 : 12,
        borderRadius: radius.field,
        borderWidth: border.thin,
        borderColor: on && !dark ? colors.ink : 'transparent',
        backgroundColor: on
          ? color
          : hovered && !it.later
            ? dark
              ? colors.inkHover
              : colors.hover
            : 'transparent',
        ...transition(['background-color']),
      }}
    >
      <Text
        style={{
          ...font('body', on ? 800 : 600),
          fontSize: 14,
          color: on ? textOn(color) : it.later ? '#9A8E7C' : dark ? colors.white : colors.ink,
        }}
      >
        {it.label}
      </Text>
      {it.later ? (
        <Text style={{ ...font('mono', 700), fontSize: 9, color: '#9A8E7C' }}>ENSUITE</Text>
      ) : it.badge ? (
        <Text
          style={{
            ...font('mono', 700),
            fontSize: 11,
            color: it.alert ? colors.white : colors.ink,
            backgroundColor: it.alert ? colors.room : on && !dark ? colors.white : colors.rating,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: 99,
            paddingHorizontal: 6,
          }}
        >
          {it.badge}
        </Text>
      ) : null}
    </View>
  )
  return (
    <Pressable
      role="link"
      aria-current={on ? 'page' : undefined}
      disabled={it.later}
      onPress={onPress}
      {...hoverProps}
    >
      {on && !dark ? (
        <Raised offset={shadow.sm} r={radius.field}>
          {row}
        </Raised>
      ) : (
        row
      )}
    </Pressable>
  )
}
