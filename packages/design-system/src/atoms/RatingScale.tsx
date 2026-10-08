import { Platform, Pressable, Text, View, type ViewProps } from 'react-native'
import { border, colors, font, transition } from '../tokens'
import { useHover } from './useHover'

const STEPS = [1, 2, 3, 4, 5]

/**
 * Note de 1 à 5 en cases (ponctualité, fair-play…). `sm` : compacte, libellé à gauche (web) ;
 * `touch` : cases de 44 px avec le chiffre, libellé et aide au-dessus (mobile).
 */
export function RatingScale({
  label,
  help,
  value,
  onChange,
  size = 'touch',
}: {
  label: string
  help?: string
  /** 0 = pas encore noté. */
  value: number
  onChange?: (v: number) => void
  size?: 'sm' | 'touch'
}) {
  const sm = size === 'sm'
  const step = (delta: number) => onChange?.(Math.min(5, Math.max(1, value + delta)))
  // Web : focus clavier et flèches, comme le Slider
  const keyboard =
    Platform.OS === 'web'
      ? ({
          tabIndex: 0,
          onKeyDown: (e: { key: string; preventDefault: () => void }) => {
            const delta = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]
            if (delta === undefined) return
            e.preventDefault()
            step(delta)
          },
        } as ViewProps)
      : null
  const cells = (
    <View
      role="slider"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={5}
      aria-valuenow={value}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      {...keyboard}
      style={{ flexDirection: 'row', gap: 5, flex: sm ? undefined : 1 }}
    >
      {STEPS.map((n) => (
        <Cell key={n} n={n} on={n <= value} sm={sm} onPress={() => onChange?.(n)} />
      ))}
    </View>
  )
  if (sm) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ width: 110, ...font('body', 600), fontSize: 13, color: colors.ink }}>
          {label}
        </Text>
        {cells}
      </View>
    )
  }
  return (
    <View style={{ gap: 8 }}>
      <View style={{ gap: 2 }}>
        <Text style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>{label}</Text>
        {help ? (
          <Text style={{ ...font('body', 400), fontSize: 12, color: colors.muted }}>{help}</Text>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row' }}>{cells}</View>
    </View>
  )
}

function Cell({
  n,
  on,
  sm,
  onPress,
}: {
  n: number
  on: boolean
  sm: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      aria-label={`${n} sur 5`}
      tabIndex={-1}
      onPress={onPress}
      {...hoverProps}
      style={{
        width: sm ? 28 : undefined,
        flex: sm ? undefined : 1,
        height: sm ? 28 : 44,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: sm ? 7 : 10,
        backgroundColor: on ? colors.rating : hovered ? colors.hover : colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...transition(['background-color']),
      }}
    >
      {sm ? null : (
        <Text style={{ ...font('mono', 700), fontSize: 14, color: colors.ink }}>{n}</Text>
      )}
    </Pressable>
  )
}
