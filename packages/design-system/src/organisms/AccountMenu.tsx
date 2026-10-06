import { useEffect, useRef, useState } from 'react'
import { Platform, Pressable, Text, View, type ViewStyle } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, motion, radius, shadow, sizes, transition, z } from '../tokens'

export type AccountMenuItem = { label: string; onPress: () => void }

type KeyTarget = {
  addEventListener: (
    type: 'keydown',
    listener: (e: { key: string; preventDefault: () => void }) => void,
  ) => void
  removeEventListener: (
    type: 'keydown',
    listener: (e: { key: string; preventDefault: () => void }) => void,
  ) => void
  activeElement: unknown
}

const ROSE = '#FFF1EC'

/** Avatar de la barre du site qui ouvre le menu du compte : liens puis « Se déconnecter ». */
export function AccountMenu({
  pseudo,
  email,
  avatarUri,
  items,
  onSignOut,
}: {
  pseudo: string
  email: string
  avatarUri?: string | null
  items: AccountMenuItem[]
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<View>(null)
  const entries = useRef<(View | null)[]>([])
  const { hovered, hoverProps } = useHover()
  const size = 36
  const lift = hovered && !open ? 2 : 0
  const move = transition(['transform'], motion.fast)

  const choose = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  // Clavier (web) : Échap ferme, flèches haut et bas entre les items, focus sur le premier à l'ouverture
  useEffect(() => {
    const doc = (globalThis as { document?: KeyTarget }).document
    if (!open || !doc) return
    entries.current[0]?.focus()
    const onKey = (e: { key: string; preventDefault: () => void }) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return trigger.current?.focus()
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      const list = entries.current.filter(Boolean)
      const at = list.indexOf(doc.activeElement as View)
      const next = (at + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length
      list[next]?.focus()
    }
    doc.addEventListener('keydown', onKey)
    return () => doc.removeEventListener('keydown', onKey)
  }, [open])

  const all = [
    ...items.map((item) => ({ ...item, signOut: false })),
    { label: 'Se déconnecter', onPress: onSignOut, signOut: true },
  ]

  return (
    <View style={{ marginLeft: 8 }}>
      <Pressable
        ref={trigger}
        role="button"
        aria-label="Menu du compte"
        aria-haspopup="menu"
        aria-expanded={open}
        onPress={() => setOpen(!open)}
        {...hoverProps}
        style={{ borderRadius: size / 2 }}
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
        <View
          style={{
            borderRadius: size / 2 + 3,
            transform: [{ translateX: -lift / 2 }, { translateY: -lift / 2 }],
            ...(open && Platform.OS === 'web' ? { boxShadow: `0 0 0 3px ${colors.rating}` } : null),
            ...move,
          }}
        >
          <Avatar name={pseudo || '?'} uri={avatarUri} size={size} />
        </View>
      </Pressable>
      {open ? (
        <>
          {/* Clic à l'extérieur : un voile transparent sous le menu */}
          <Pressable
            aria-hidden
            tabIndex={-1}
            onPress={() => setOpen(false)}
            style={{
              position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as ViewStyle['position'],
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: z.popover,
              cursor: 'auto',
            }}
          />
          <Raised
            offset={shadow.card}
            r={radius.card}
            style={{ position: 'absolute', top: 48, right: 0, width: 260, zIndex: z.popover + 1 }}
          >
            <View
              role="menu"
              style={{
                backgroundColor: colors.white,
                borderWidth: border.base,
                borderColor: colors.ink,
                borderRadius: radius.card,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: border.thin,
                  borderColor: colors.line,
                }}
              >
                <Avatar name={pseudo || '?'} uri={avatarUri} size={sizes.avatar.m} />
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>
                    {pseudo}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{ ...font('body', 400), fontSize: 13, color: colors.muted }}
                  >
                    {email}
                  </Text>
                </View>
              </View>
              {all.map((item, i) => (
                <MenuEntry
                  key={item.label}
                  ref={(node) => {
                    entries.current[i] = node
                  }}
                  label={item.label}
                  signOut={item.signOut}
                  onPress={choose(item.onPress)}
                />
              ))}
            </View>
          </Raised>
        </>
      ) : null}
    </View>
  )
}

function MenuEntry({
  ref,
  label,
  signOut,
  onPress,
}: {
  ref: (node: View | null) => void
  label: string
  signOut: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      ref={ref}
      role="menuitem"
      onPress={onPress}
      {...hoverProps}
      style={{
        paddingVertical: signOut ? 12 : 11,
        paddingHorizontal: 16,
        borderTopWidth: signOut ? border.thin : 0,
        borderColor: colors.line,
        backgroundColor: hovered ? (signOut ? ROSE : colors.hover) : 'transparent',
        ...transition(['background-color']),
      }}
    >
      <Text
        style={{
          ...font('body', signOut ? 800 : 600),
          fontSize: 14,
          color: signOut ? colors.room : colors.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
