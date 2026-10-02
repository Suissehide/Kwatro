import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { border, colors, font, grid, radius, shadow, textOn } from '../tokens'

export type SidebarItem = {
  key: string
  label: string
  /** Pastille de compteur (ex. « 3 »). */
  badge?: string
  /** Fonctionnalité prévue plus tard : grisée, non cliquable. */
  later?: boolean
}

/** Barre latérale web 240 px (espace lieu, admin). */
export function Sidebar({
  title,
  items,
  active,
  onSelect,
  color = colors.venue,
  footer,
}: {
  title: string
  items: SidebarItem[]
  active: string
  onSelect: (key: string) => void
  color?: string
  footer?: ReactNode
}) {
  return (
    <View
      role="navigation"
      style={{
        width: grid.sidebar,
        backgroundColor: colors.white,
        borderRightWidth: border.base,
        borderColor: colors.ink,
        paddingVertical: 20,
        paddingHorizontal: 16,
        gap: 6,
      }}
    >
      <Text
        style={{ ...font('display'), fontSize: 20, textTransform: 'uppercase', color: colors.ink }}
      >
        Kwatro
      </Text>
      <Typography variant="label" style={{ marginBottom: 14 }}>
        {title}
      </Typography>
      {items.map((it) => {
        const on = it.key === active
        const row = (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: radius.field,
              borderWidth: border.thin,
              borderColor: on ? colors.ink : 'transparent',
              backgroundColor: on ? color : 'transparent',
            }}
          >
            <Text
              style={{
                ...font('body', on ? 800 : 600),
                fontSize: 14,
                color: on ? textOn(color) : it.later ? '#9A8E7C' : colors.ink,
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
                  color: colors.ink,
                  backgroundColor: on ? colors.white : colors.kwote,
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
            key={it.key}
            role="link"
            aria-current={on ? 'page' : undefined}
            disabled={it.later}
            onPress={() => onSelect(it.key)}
          >
            {on ? (
              <Raised offset={shadow.sm} r={radius.field}>
                {row}
              </Raised>
            ) : (
              row
            )}
          </Pressable>
        )
      })}
      <View style={{ flex: 1 }} />
      {footer}
    </View>
  )
}
