import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { colors, motion, prefersReducedMotion, transition } from '../tokens'

type Slot = 'tl' | 'tr' | 'c' | 'bl' | 'br'
/**
 * Position des quatre points pour chaque face du dé (1 à 4). Les points en trop se superposent :
 * en passant de 1 à 4, ils naissent au centre, se séparent puis rejoignent les quatre coins.
 */
const FACES: Record<1 | 2 | 3 | 4, [Slot, Slot, Slot, Slot]> = {
  1: ['c', 'c', 'c', 'c'],
  2: ['tl', 'tl', 'br', 'br'],
  3: ['tl', 'c', 'c', 'br'],
  4: ['tl', 'tr', 'bl', 'br'],
}
const STEP = 110 // ms entre deux faces : un, deux, trois, quatre en ~1/3 s

/**
 * Logo Kwatro, comme le favicon du site (apps/web/src/app/icon.svg) : carré jaune, quatre points.
 * `rolling` (survol du lien de la marque) : le dé se soulève de son ombre, fait un quart de tour
 * et compte jusqu'à quatre. Animations réduites : il se soulève seulement.
 */
export function Logo({ size = 32, rolling }: { size?: number; rolling?: boolean }) {
  const [face, setFace] = useState<keyof typeof FACES>(4)
  const [turns, setTurns] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (!rolling || prefersReducedMotion()) return
    setTurns((t) => t + 1)
    setFace(1)
    timers.current = ([2, 3, 4] as const).map((f, i) =>
      setTimeout(() => setFace(f), STEP * (i + 1)),
    )
    return () => {
      for (const t of timers.current) clearTimeout(t)
      setFace(4)
    }
  }, [rolling])

  const borderWidth = Math.max(2, size * 0.08)
  const padding = size * 0.14
  const dot = size * 0.19
  const far = size - 2 * borderWidth - 2 * padding - dot
  const at: Record<Slot, { left: number; top: number }> = {
    tl: { left: 0, top: 0 },
    tr: { left: far, top: 0 },
    c: { left: far / 2, top: far / 2 },
    bl: { left: 0, top: far },
    br: { left: far, top: far },
  }
  const r = size * 0.2
  const lift = rolling ? Math.max(1.5, size * 0.06) : 0
  // Même rotation pour le dé et son ombre : l'ombre reste décalée en bas à droite pendant le tour
  const spin = { rotate: `${turns * 90}deg` }
  const roll = transition(['transform'], motion.slow, motion.spring)

  return (
    <View aria-hidden style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: colors.ink,
          transform: [{ translateX: lift }, { translateY: lift }, spin],
          ...roll,
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: colors.kwote,
          borderWidth,
          borderColor: colors.ink,
          borderRadius: r,
          padding,
          transform: [{ translateX: -lift / 2 }, { translateY: -lift / 2 }, spin],
          ...roll,
        }}
      >
        <View style={{ flex: 1 }}>
          {FACES[face].map((slot, i) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: les quatre points sont fixes, seule leur place change
              key={i}
              style={{
                position: 'absolute',
                ...at[slot],
                width: dot,
                height: dot,
                borderRadius: dot,
                backgroundColor: colors.ink,
                ...transition(['left', 'top'], STEP, motion.spring),
              }}
            />
          ))}
        </View>
      </View>
    </View>
  )
}
