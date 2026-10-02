import { border, colors, font, Raised, radius, textOn, type } from '@kwatro/design-system'
import { useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  PanResponder,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'

/** Quatre cartes, une par couleur de contenu : Kwatro se joue à quatre. */
const CARDS = [
  {
    color: colors.room,
    kind: 'Rooms',
    title: 'Une table ce soir',
    text: 'Rejoins une partie près de chez toi, ou ouvre la tienne et trouve ton quatrième.',
  },
  {
    color: colors.event,
    kind: 'Événements',
    title: 'Les soirées des lieux',
    text: 'Tournois, soirées jeux et initiations des boutiques et des bars, au même endroit.',
  },
  {
    color: colors.venue,
    kind: 'Lieux',
    title: 'Où jouer en ville',
    text: 'Boutiques TCG, bars à jeux, ludothèques : la carte de ta ville, et leurs avantages Kwatro.',
  },
  {
    color: colors.kwote,
    kind: 'Kwote',
    title: 'Ton niveau, partie après partie',
    text: 'En TCG, chaque partie classée fait bouger ta Kwote. Des adversaires à ta mesure.',
  },
] as const

const TILT = [-2, 3, -4, 2] // inclinaison propre à chaque carte, comme un paquet posé à la main
const AUTOPLAY_MS = 4500
const SWIPE = 70
const native = Platform.OS !== 'web'

/** Cartes de présentation de l'accueil : la carte du dessus glisse (doigt ou minuterie), la suivante surgit. */
export function IntroDeck() {
  const [index, setIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const x = useRef(new Animated.Value(0)).current
  const pop = useRef(new Animated.Value(1)).current
  const width = useRef(320)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => sub.remove()
  }, [])

  const show = (next: number) => {
    x.setValue(0)
    setIndex((next + CARDS.length) % CARDS.length)
    if (reduceMotion) return
    pop.setValue(0)
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 140, useNativeDriver: native }).start()
  }

  // Carte du dessus jetée vers la gauche (suivante) ou la droite (précédente)
  const fling = (dir: -1 | 1) => {
    const next = index - dir
    if (reduceMotion) return show(next)
    Animated.timing(x, {
      toValue: dir * width.current * 1.3,
      duration: 220,
      useNativeDriver: native,
    }).start(() => show(next))
  }

  // Défilement automatique, relancé à chaque changement de carte ; coupé si animations réduites
  // biome-ignore lint/correctness/useExhaustiveDependencies: fling change à chaque rendu, l'index suffit
  useEffect(() => {
    if (reduceMotion) return
    const t = setTimeout(() => fling(-1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [index, reduceMotion])

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => x.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE) flingRef.current(g.dx < 0 ? -1 : 1)
        else Animated.spring(x, { toValue: 0, friction: 7, useNativeDriver: native }).start()
      },
    }),
  ).current
  // Le PanResponder est créé une fois : il passe par une ref pour voir l'index courant
  const flingRef = useRef(fling)
  flingRef.current = fling

  // Du fond vers le dessus : les trois cartes suivantes dépassent derrière celle affichée
  const order = [3, 2, 1, 0].map((depth) => ({ depth, i: (index + depth) % CARDS.length }))

  return (
    <View style={{ gap: 26 }}>
      <View
        onLayout={(e) => {
          width.current = e.nativeEvent.layout.width
        }}
        style={{ height: 270, width: '100%', maxWidth: 360, alignSelf: 'center' }}
      >
        {order.map(({ depth, i }) => {
          const card = CARDS[i] as (typeof CARDS)[number]
          const fg = textOn(card.color)
          const top = depth === 0
          const tilt = TILT[i] ?? 0
          const rest = { rotate: `${tilt}deg`, translateY: depth * 7, scale: 1 - depth * 0.04 }
          const transform = top
            ? [
                { translateX: x },
                {
                  rotate: x.interpolate({
                    inputRange: [-300, 0, 300],
                    outputRange: [`${tilt - 14}deg`, rest.rotate, `${tilt + 14}deg`],
                  }),
                },
                { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
              ]
            : [{ translateY: rest.translateY }, { rotate: rest.rotate }, { scale: rest.scale }]
          return (
            <Animated.View
              key={card.kind}
              {...(top ? pan.panHandlers : null)}
              aria-hidden={!top}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transform }}
            >
              <Pressable
                disabled={!top}
                onPress={() => fling(-1)}
                aria-label={`${card.title}. ${card.text} Carte ${i + 1} sur ${CARDS.length}, toucher pour la suivante`}
                style={{ flex: 1 }}
              >
                <Raised offset={top ? 6 : 4} r={radius.sheet} style={{ flex: 1 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: card.color,
                      borderWidth: border.base,
                      borderColor: colors.ink,
                      borderRadius: radius.sheet,
                      padding: 20,
                      justifyContent: 'space-between',
                    }}
                  >
                    <Corner n={i + 1} kind={card.kind} color={fg} />
                    <View style={{ gap: 8 }}>
                      <Text style={[type.h1, { color: fg }]}>{card.title}</Text>
                      <Text
                        style={{ ...font('body', 600), fontSize: 15, lineHeight: 21, color: fg }}
                      >
                        {card.text}
                      </Text>
                    </View>
                    <View style={{ alignSelf: 'flex-end', transform: [{ rotate: '180deg' }] }}>
                      <Corner n={i + 1} color={fg} />
                    </View>
                  </View>
                </Raised>
              </Pressable>
            </Animated.View>
          )
        })}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
        {CARDS.map((card, i) => (
          <Pressable
            key={card.kind}
            role="button"
            aria-label={`Carte ${i + 1} : ${card.title}`}
            aria-current={i === index}
            onPress={() => show(i)}
            hitSlop={10}
            style={{
              width: i === index ? 28 : 12,
              height: 12,
              borderRadius: 99,
              borderWidth: border.thin,
              borderColor: colors.ink,
              backgroundColor: i === index ? card.color : colors.white,
            }}
          />
        ))}
      </View>
    </View>
  )
}

/** Index de coin, comme sur une carte à jouer. */
function Corner({ n, kind, color }: { n: number; kind?: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
      <Text style={{ ...font('display'), fontSize: 26, lineHeight: 28, color }}>{n}</Text>
      {kind ? <Text style={[type.label, { color }]}>{kind}</Text> : null}
    </View>
  )
}
