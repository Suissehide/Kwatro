import { Pressable, Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

/**
 * Barre d'étapes (onboarding, création de room). `current` = nombre d'étapes faites.
 * `labels` : « 1. Le jeu » sous chaque segment ; avec `onStep`, une étape atteinte se clique pour y revenir.
 */
export function ProgressSteps({
  current,
  total,
  color = colors.room,
  labels,
  onStep,
}: {
  current: number
  total: number
  color?: string
  labels?: string[]
  onStep?: (index: number) => void
}) {
  const steps = Array.from({ length: total }, (_, i) => i + 1)
  const bar = (step: number) => (
    <View
      style={{
        height: 10,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 99,
        backgroundColor: step <= current ? color : colors.white,
      }}
    />
  )
  return (
    <View
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Étape ${current} sur ${total}`}
      style={{ flexDirection: 'row', gap: labels ? 8 : 6 }}
    >
      {steps.map((step) => {
        const label = labels?.[step - 1]
        if (!label) {
          return (
            <View key={step} style={{ flex: 1 }}>
              {bar(step)}
            </View>
          )
        }
        const reached = step <= current
        return (
          <Pressable
            key={step}
            role="button"
            aria-label={`Revenir à l'étape ${step}`}
            disabled={!onStep || !reached}
            onPress={() => onStep?.(step - 1)}
            style={{ flex: 1, gap: 6 }}
          >
            {bar(step)}
            <Text
              style={{
                ...font('body', step === current ? 800 : 600),
                fontSize: 12,
                color: reached ? colors.ink : colors.muted,
              }}
            >
              {`${step}. ${label}`}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
