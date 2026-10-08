import { type ReactNode, useRef, useState } from 'react'
import { Modal, Pressable, useWindowDimensions, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { border, colors, radius, shadow } from '../tokens'
import type { MenuAnchor } from './ContextMenu'

const GAP = 8
const MARGIN = 8

/**
 * Panneau flottant ancré sous son déclencheur (au-dessus s'il manque de place), aligné à gauche et
 * gardé dans la fenêtre. `trigger` reçoit `open` et `toggle` ; clic à l'extérieur ou Échap : fermé.
 * `children` reçoit `close` (choix d'une date qui referme le panneau). `bare` : sans cadre, pour un
 * contenu qui a déjà le sien (calendrier).
 */
export function Popover({
  trigger,
  label,
  width = 320,
  bare,
  children,
}: {
  trigger: (state: { open: boolean; toggle: () => void }) => ReactNode
  /** Nom du panneau pour les lecteurs d'écran (« Choisir une date »). */
  label: string
  width?: number
  bare?: boolean
  children: (close: () => void) => ReactNode
}) {
  const win = useWindowDimensions()
  const ref = useRef<View>(null)
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null)
  const [height, setHeight] = useState(0)
  const close = () => {
    setAnchor(null)
    setHeight(0)
  }
  const toggle = () =>
    anchor
      ? close()
      : ref.current?.measureInWindow((x, y, w, h) => setAnchor({ x, y, width: w, height: h }))

  const panelWidth = Math.min(width, win.width - 2 * MARGIN)
  const below = anchor ? anchor.y + anchor.height + GAP : 0
  const top =
    anchor && below + height > win.height - MARGIN
      ? Math.max(MARGIN, anchor.y - height - GAP)
      : below
  const left = anchor ? Math.max(MARGIN, Math.min(anchor.x, win.width - panelWidth - MARGIN)) : 0

  return (
    <View ref={ref} collapsable={false}>
      {trigger({ open: !!anchor, toggle })}
      {anchor ? (
        <Modal transparent visible onRequestClose={close}>
          <Pressable
            aria-label="Fermer"
            onPress={close}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'auto' }}
          />
          <Raised
            offset={shadow.md}
            r={radius.card}
            // Mesuré avant d'être montré : sa hauteur décide s'il s'ouvre au-dessus ou en dessous
            style={{ position: 'absolute', top, left, width: panelWidth, opacity: height ? 1 : 0 }}
          >
            <View
              role="dialog"
              aria-label={label}
              onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
              style={
                bare
                  ? null
                  : {
                      backgroundColor: colors.white,
                      borderWidth: border.base,
                      borderColor: colors.ink,
                      borderRadius: radius.card,
                      overflow: 'hidden',
                    }
              }
            >
              {children(close)}
            </View>
          </Raised>
        </Modal>
      ) : null}
    </View>
  )
}
