import { useEffect, useRef } from 'react'
import { Animated, Easing, Platform, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { Logo } from '../atoms/Logo'
import { Raised } from '../atoms/Raised'
import { useReducedMotion } from '../atoms/useReducedMotion'
import { border, colors, radius } from '../tokens'

/**
 * QR de venue (jeton signé) sur cadre jaune, pensé pour un écran noir. `scanning` : ligne qui balaie
 * le code. La luminosité au maximum (expo-brightness) se règle dans l'écran, pas ici.
 */
export function QrPass({
  value,
  pseudo,
  size = 250,
  scanning,
}: {
  value: string
  pseudo: string
  size?: number
  scanning?: boolean
}) {
  return (
    <Raised offset={6} r={radius.sheet} color={colors.rating} style={{ alignSelf: 'center' }}>
      <View
        role="img"
        aria-label={`QR Lucko de ${pseudo}`}
        style={{
          padding: 16,
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.rating,
          borderRadius: radius.sheet,
        }}
      >
        <View style={{ width: size, height: size, overflow: 'hidden' }}>
          <QRCode
            value={value}
            size={size}
            ecl="H"
            color={colors.ink}
            backgroundColor={colors.white}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Logo size={46} />
          </View>
          {scanning ? <ScanLine size={size} /> : null}
        </View>
      </View>
    </Raised>
  )
}

function ScanLine({ size }: { size: number }) {
  const reduced = useReducedMotion()
  const y = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (reduced !== false) return
    const loop = Animated.loop(
      Animated.timing(y, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [reduced, y])
  if (reduced !== false) return null
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: colors.room,
        transform: [
          { translateY: y.interpolate({ inputRange: [0, 1], outputRange: [0, size - 3] }) },
        ],
      }}
    />
  )
}
