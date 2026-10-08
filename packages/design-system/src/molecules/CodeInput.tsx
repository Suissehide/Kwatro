import { useEffect, useRef, useState } from 'react'
import { Animated, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { useReducedMotion } from '../atoms/useReducedMotion'
import { border, colors, font, radius } from '../tokens'

/**
 * Code à cases (SMS du lieu, vérification d'e-mail). Un seul champ caché reçoit la saisie,
 * le collage et l'autoremplissage SMS ; les cases ne font qu'afficher.
 */
export function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  label = 'Code de vérification',
}: {
  length?: number
  value: string
  onChange: (v: string) => void
  onComplete?: (v: string) => void
  /** Message d'erreur : bordures rouges et rangée qui tremble. */
  error?: string
  label?: string
}) {
  const input = useRef<TextInput>(null)
  const [focused, setFocused] = useState(false)
  const shake = useRef(new Animated.Value(0)).current
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!error || reduced !== false) return
    shake.setValue(0)
    Animated.sequence(
      [8, -8, 6, -6, 0].map((toValue) =>
        Animated.timing(shake, { toValue, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
      ),
    ).start()
  }, [error, reduced, shake])

  const change = (text: string) => {
    const code = text.replace(/\D/g, '').slice(0, length)
    onChange(code)
    if (code.length === length) onComplete?.(code)
  }

  return (
    <View style={{ gap: 8 }}>
      <Pressable onPress={() => input.current?.focus()} aria-hidden>
        <Animated.View style={{ flexDirection: 'row', gap: 8, transform: [{ translateX: shake }] }}>
          {Array.from({ length }, (_, i) => i).map((i) => {
            const active = focused && i === Math.min(value.length, length - 1)
            return (
              <View
                key={i}
                style={{
                  width: 52,
                  height: 60,
                  borderWidth: border.base,
                  borderColor: error ? colors.room : colors.ink,
                  borderRadius: radius.field,
                  backgroundColor: colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(active
                    ? { outlineWidth: 4, outlineStyle: 'solid', outlineColor: colors.rating }
                    : null),
                }}
              >
                <Text style={{ ...font('mono', 700), fontSize: 26, color: colors.ink }}>
                  {value[i] ?? ''}
                </Text>
              </View>
            )
          })}
        </Animated.View>
      </Pressable>
      <TextInput
        ref={input}
        value={value}
        onChangeText={change}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label}
        aria-invalid={!!error}
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        caretHidden
        style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, opacity: 0 }}
      />
      {error ? (
        <Text role="alert" style={{ ...font('body', 600), fontSize: 13, color: colors.room }}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}
