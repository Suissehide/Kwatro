import { useEffect, useRef } from 'react'
import { Animated, Pressable } from 'react-native'
import { border, colors } from '../tokens'
import { useReducedMotion } from './useReducedMotion'

// Course de la pastille : 46 - 2 × bordure - 2 × marge - 18
const TRAVEL = 20

export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange?: (v: boolean) => void
  label: string
}) {
  const reduced = useReducedMotion()
  const on = useRef(new Animated.Value(value ? 1 : 0)).current
  useEffect(() => {
    if (reduced !== false) return on.setValue(value ? 1 : 0)
    // Couleurs animées : pas de pilote natif
    Animated.spring(on, {
      toValue: value ? 1 : 0,
      friction: 7,
      tension: 140,
      useNativeDriver: false,
    }).start()
  }, [value, reduced, on])
  const color = (off: string, onColor: string) =>
    on.interpolate({ inputRange: [0, 1], outputRange: [off, onColor], extrapolate: 'clamp' })

  return (
    <Pressable
      role="switch"
      aria-checked={value}
      aria-label={label}
      onPress={() => onChange?.(!value)}
      hitSlop={9}
    >
      <Animated.View
        style={{
          width: 46,
          height: 26,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: 99,
          backgroundColor: color(colors.white, colors.venue),
          justifyContent: 'center',
          paddingHorizontal: 2,
        }}
      >
        <Animated.View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: color(colors.ink, colors.white),
            borderWidth: border.thin,
            borderColor: colors.ink,
            transform: [
              { translateX: on.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] }) },
            ],
          }}
        />
      </Animated.View>
    </Pressable>
  )
}
