import { useEffect, useRef } from 'react'
import { Animated, Platform, Pressable, Text, View } from 'react-native'
import { useReducedMotion } from '../atoms/useReducedMotion'
import { border, colors, font, motion, onColor, radius, shadow } from '../tokens'

// Position du coin haut gauche dans l'éventail, par taille
const ZERO = {
  digit: '0',
  bg: colors.rating,
  fg: onColor.rating,
  deg: 2,
  lg: [170, 10],
  sm: [95, 6],
} as const
const CARDS = [
  { digit: '4', bg: colors.room, fg: onColor.room, deg: -12, lg: [20, 40], sm: [4, 24] },
  ZERO,
  { digit: '4', bg: colors.event, fg: onColor.event, deg: 14, lg: [320, 52], sm: [186, 30] },
] as const

const SIZES = {
  lg: {
    width: 200,
    height: 280,
    r: 16,
    fontSize: 140,
    offset: shadow.card,
    box: { width: 520, height: 380 },
  },
  sm: {
    width: 110,
    height: 154,
    r: radius.button,
    fontSize: 76,
    offset: shadow.md,
    box: { width: 300, height: 200 },
  },
} as const

const STAGGER = 60
/** Durée perçue de la donne : le contenu voisin peut apparaître après. */
export const CARD_FAN_DEAL_MS = STAGGER * (CARDS.length - 1) + motion.normal

const useNativeDriver = Platform.OS !== 'web'
const deg = (value: Animated.AnimatedAddition<number>) =>
  value.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] })

/**
 * Trois cartes « 4 0 4 » en éventail. À l'apparition elles sont distribuées depuis une pile,
 * un appui les ramasse et les redistribue, le survol (web) soulève une carte.
 */
export function CardFan({ size = 'lg' }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size]
  const reduced = useReducedMotion()
  const anims = useRef(
    CARDS.map((card) => ({
      card,
      deal: new Animated.Value(0),
      shown: new Animated.Value(0),
      hover: new Animated.Value(0),
    })),
  ).current
  const busy = useRef(false)

  const deal = () => {
    busy.current = true
    Animated.stagger(
      STAGGER,
      anims.map((a) =>
        Animated.parallel([
          Animated.spring(a.deal, { toValue: 1, friction: 7, tension: 80, useNativeDriver }),
          Animated.timing(a.shown, { toValue: 1, duration: motion.instant, useNativeDriver }),
        ]),
      ),
    ).start(() => {
      busy.current = false
    })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: donne jouée une fois, dès que le réglage est connu
  useEffect(() => {
    if (reduced === null) return
    if (!reduced) return deal()
    for (const a of anims) {
      a.deal.setValue(1)
      a.shown.setValue(1)
      a.hover.setValue(0)
    }
  }, [reduced])

  const redeal = () => {
    if (reduced !== false || busy.current) return
    busy.current = true
    Animated.parallel(
      anims.map((a) =>
        Animated.timing(a.deal, { toValue: 0, duration: motion.fast, useNativeDriver }),
      ),
    ).start(deal)
  }

  const hover = (value: Animated.Value, toValue: 0 | 1) => {
    if (reduced !== false) return
    Animated.timing(value, { toValue, duration: motion.fast, useNativeDriver }).start()
  }

  const [stackX, stackY] = ZERO[size]
  return (
    <Pressable
      role={reduced ? undefined : 'button'}
      aria-label={reduced ? undefined : 'Redistribuer les cartes'}
      disabled={reduced !== false}
      onPress={redeal}
      style={{ ...s.box, borderRadius: radius.card }}
    >
      {anims.map((a, i) => {
        const { card } = a
        const [x, y] = card[size]
        const lift = a.hover.interpolate({ inputRange: [0, 1], outputRange: [0, -8] })
        const drop = Animated.add(
          a.deal.interpolate({ inputRange: [0, 1], outputRange: [0, s.offset] }),
          a.hover.interpolate({ inputRange: [0, 1], outputRange: [0, shadow.xl - s.offset] }),
        )
        return (
          <Animated.View
            key={`${card.digit}-${card.deg}`}
            aria-hidden
            onPointerEnter={() => hover(a.hover, 1)}
            onPointerLeave={() => hover(a.hover, 0)}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s.width,
              height: s.height,
              zIndex: i,
              opacity: a.shown,
              transform: [
                {
                  translateX: a.deal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [stackX - x, 0],
                  }),
                },
                {
                  translateY: Animated.add(
                    a.deal.interpolate({ inputRange: [0, 1], outputRange: [stackY - y + 24, 0] }),
                    lift,
                  ),
                },
                {
                  rotate: deg(
                    Animated.add(
                      a.deal.interpolate({ inputRange: [0, 1], outputRange: [0, card.deg] }),
                      a.hover.interpolate({ inputRange: [0, 1], outputRange: [0, -card.deg / 2] }),
                    ),
                  ),
                },
              ],
            }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: s.r,
                backgroundColor: colors.ink,
                transform: [{ translateX: drop }, { translateY: drop }],
              }}
            />
            <View
              style={{
                flex: 1,
                backgroundColor: card.bg,
                borderWidth: border.base,
                borderColor: colors.ink,
                borderRadius: s.r,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  ...font('display'),
                  fontSize: s.fontSize,
                  lineHeight: s.fontSize,
                  color: card.fg,
                }}
              >
                {card.digit}
              </Text>
            </View>
          </Animated.View>
        )
      })}
    </Pressable>
  )
}
