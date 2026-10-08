import { Pressable, Text, View } from 'react-native'
import { border, colors, font, transition } from '../tokens'
import { useHover } from './useHover'

/**
 * Barre d'étapes (onboarding, création de room, parcours lieu). `current` = nombre d'étapes faites.
 * `labels` : libellé sous chaque segment ; `onStepPress` : retour à une étape déjà faite.
 */
export function ProgressSteps({
  current,
  total,
  color = colors.room,
  labels,
  onStepPress,
}: {
  current: number
  total: number
  color?: string
  labels?: string[]
  onStepPress?: (step: number) => void
}) {
  return (
    <View
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Étape ${current} sur ${total}`}
      style={{ flexDirection: 'row', gap: 6 }}
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <Step
          key={step}
          done={step <= current}
          active={step === current}
          color={color}
          label={labels?.[step - 1]}
          onPress={onStepPress && step < current ? () => onStepPress(step) : undefined}
        />
      ))}
    </View>
  )
}

function Step({
  done,
  active,
  color,
  label,
  onPress,
}: {
  done: boolean
  active: boolean
  color: string
  label?: string
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const bar = (
    <View
      style={{
        height: 10,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 99,
        backgroundColor: done ? color : colors.white,
      }}
    />
  )
  if (!label) return <View style={{ flex: 1 }}>{bar}</View>
  const text = (
    <Text
      style={{
        ...font('body', active ? 800 : 600),
        fontSize: 12,
        color: hovered && onPress ? colors.room : done ? colors.ink : colors.muted,
        ...transition(['color']),
      }}
    >
      {label}
    </Text>
  )
  return onPress ? (
    <Pressable
      role="link"
      aria-label={`Revenir à : ${label}`}
      onPress={onPress}
      {...hoverProps}
      style={{ flex: 1, gap: 4 }}
    >
      {bar}
      {text}
    </Pressable>
  ) : (
    <View style={{ flex: 1, gap: 4 }}>
      {bar}
      {text}
    </View>
  )
}
