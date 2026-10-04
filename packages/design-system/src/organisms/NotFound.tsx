import { useEffect, useRef } from 'react'
import { Animated, Platform, Text, View } from 'react-native'
import { Button } from '../atoms/Button'
import { TextLink } from '../atoms/TextLink'
import { Typography } from '../atoms/Typography'
import { useReducedMotion } from '../atoms/useReducedMotion'
import { CARD_FAN_DEAL_MS, CardFan } from '../molecules/CardFan'
import { colors, font, motion, type } from '../tokens'

export type NotFoundAction = { label: string; onPress: () => void }

/** Contenu de la page 404 (app et site) : cartes « 4 0 4 », message, deux sorties. */
export function NotFound({
  wide,
  onHome,
  secondary,
  report,
}: {
  wide: boolean
  onHome: () => void
  secondary: NotFoundAction
  /** Ligne « lien cassé » sous les boutons, sur grand écran. */
  report?: { prompt: string; onPress: () => void }
}) {
  const reduced = useReducedMotion()
  const reveal = useRef(new Animated.Value(0)).current

  // biome-ignore lint/correctness/useExhaustiveDependencies: apparition jouée une fois
  useEffect(() => {
    if (reduced === null) return
    if (reduced) return reveal.setValue(1)
    Animated.timing(reveal, {
      toValue: 1,
      duration: motion.fast,
      delay: CARD_FAN_DEAL_MS,
      easing: (t) => 1 - (1 - t) ** 3,
      useNativeDriver: Platform.OS !== 'web',
    }).start()
  }, [reduced])

  const actions = (
    <View
      style={
        wide
          ? { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }
          : { gap: 10, alignSelf: 'stretch' }
      }
    >
      <Button label="Retour à l'accueil" kind="room" onPress={onHome} />
      <Button label={secondary.label} kind="ghost" onPress={secondary.onPress} />
    </View>
  )

  const text = (
    <Animated.View
      style={{
        gap: wide ? 20 : 12,
        alignItems: 'flex-start',
        opacity: reveal,
        transform: [
          { translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
        ],
      }}
    >
      <Text style={type.label}>{wide ? 'Erreur 404 · page introuvable' : 'Erreur 404'}</Text>
      <Typography variant={wide ? 'hero' : 'h1'}>Cette page a quitté la table</Typography>
      <Text
        style={{
          ...font('body', 500),
          fontSize: wide ? 17 : 15,
          lineHeight: wide ? 26 : 22,
          maxWidth: 460,
          color: colors.ink,
        }}
      >
        Le lien est peut-être cassé, ou la page a été déplacée. La soirée continue ailleurs.
      </Text>
      {wide ? actions : null}
      {wide && report ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <Text style={type.small}>{report.prompt}</Text>
          <TextLink label="Signale-le" onPress={report.onPress} />
        </View>
      ) : null}
    </Animated.View>
  )

  if (!wide) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', gap: 28, paddingHorizontal: 4 }}>
        <View style={{ alignSelf: 'center' }}>
          <CardFan size="sm" />
        </View>
        {text}
        <Animated.View style={{ opacity: reveal }}>{actions}</Animated.View>
      </View>
    )
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 72 }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <CardFan />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>{text}</View>
    </View>
  )
}
