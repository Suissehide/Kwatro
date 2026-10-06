import type { LucideIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Modal, Pressable, Text, useWindowDimensions, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, transition } from '../tokens'

/** Zone (coordonnées de la fenêtre) à côté de laquelle le menu s'ouvre : un élément, ou le point d'un clic droit. */
export type MenuAnchor = { x: number; y: number; width: number; height: number }

export type ContextMenuItem = {
  label: string
  icon?: LucideIcon
  /** Action destructrice, en rouge. */
  danger?: boolean
  onPress: () => void
}

const WIDTH = 220
const GAP = 6
const MARGIN = 8

/**
 * Menu contextuel, comme un clic droit : s'ouvre sous `anchor` (au-dessus s'il manque de place), aligné
 * à gauche ou à droite de l'ancre. Clic à l'extérieur ou Échap : `onClose`.
 */
export function ContextMenu({
  anchor,
  align = 'left',
  title,
  items,
  onClose,
}: {
  anchor: MenuAnchor | null
  align?: 'left' | 'right'
  /** Petit libellé au-dessus des items (« Pourquoi signaler ? »). */
  title?: string
  items: ContextMenuItem[]
  onClose: () => void
}) {
  const win = useWindowDimensions()
  const [height, setHeight] = useState(0)
  if (!anchor) return null

  // Point d'un clic droit : toujours à droite du curseur
  const x = align === 'right' && anchor.width ? anchor.x + anchor.width - WIDTH : anchor.x
  const left = Math.min(Math.max(MARGIN, x), win.width - WIDTH - MARGIN)
  const below = anchor.y + anchor.height + GAP
  const top =
    below + height > win.height - MARGIN ? Math.max(MARGIN, anchor.y - height - GAP) : below

  return (
    <Modal transparent visible onRequestClose={onClose}>
      <Pressable
        aria-label="Fermer le menu"
        onPress={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'auto' }}
      />
      <Raised
        offset={shadow.sm}
        r={radius.field}
        style={{ position: 'absolute', top, left, width: WIDTH, opacity: height ? 1 : 0 }}
      >
        <View
          role="menu"
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
          style={{
            backgroundColor: colors.white,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: radius.field,
            paddingVertical: 4,
            overflow: 'hidden',
          }}
        >
          {title ? (
            <Typography
              variant="label"
              style={{ fontSize: 10, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 4 }}
            >
              {title}
            </Typography>
          ) : null}
          {items.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </View>
      </Raised>
    </Modal>
  )
}

function MenuItem({ label, icon: Icon, danger, onPress }: ContextMenuItem) {
  const { hovered, hoverProps } = useHover()
  const color = danger ? colors.room : colors.ink
  return (
    <Pressable
      role="menuitem"
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
        paddingHorizontal: 12,
        backgroundColor: hovered ? (danger ? colors.roomPale : colors.hover) : 'transparent',
        ...transition(['background-color']),
      }}
    >
      {Icon ? <Icon size={16} color={color} strokeWidth={2.5} /> : null}
      <Text style={{ ...font('body', 600), fontSize: 14, color }}>{label}</Text>
    </Pressable>
  )
}
