import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { border, colors, font, transition } from '../tokens'
import { useHover } from './useHover'

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
        return (
          <LabeledStep
            key={step}
            step={step}
            label={label}
            bar={bar(step)}
            reached={step <= current}
            active={step === current}
            onPress={onStep ? () => onStep(step - 1) : undefined}
          />
        )
      })}
    </View>
  )
}

function LabeledStep({
  step,
  label,
  bar,
  reached,
  active,
  onPress,
}: {
  step: number
  label: string
  bar: ReactNode
  reached: boolean
  active: boolean
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const clickable = !!onPress && reached
  return (
    <Pressable
      role="button"
      aria-label={`Revenir à l'étape ${step}`}
      disabled={!clickable}
      onPress={onPress}
      {...hoverProps}
      style={{ flex: 1, gap: 6 }}
    >
      {bar}
      <Text
        style={{
          ...font('body', active ? 800 : 600),
          fontSize: 12,
          color: clickable && hovered ? colors.room : reached ? colors.ink : colors.muted,
          ...transition(['color']),
        }}
      >
        {`${step}. ${label}`}
      </Text>
    </Pressable>
  )
}
