import { View } from 'react-native'
import { border, colors } from '../tokens'

/** Barre d'étapes (onboarding, création de room). `current` = nombre d'étapes faites. */
export function ProgressSteps({
  current,
  total,
  color = colors.room,
}: {
  current: number
  total: number
  color?: string
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
      {Array.from({ length: total }, (_, i) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: liste fixe de segments
          key={i}
          style={{
            flex: 1,
            height: 10,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: 99,
            backgroundColor: i < current ? color : colors.white,
          }}
        />
      ))}
    </View>
  )
}
