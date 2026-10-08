import { Pressable, Text, View } from 'react-native'
import { useHover } from '../atoms/useHover'
import { Brand } from '../molecules/Brand'
import { border, colors, font, radius, textOn, transition } from '../tokens'

/**
 * Panneau noir à gauche d'un parcours en étapes sur desktop : marque, accroche et liste des étapes
 * (faite : venue, en cours : rating, à venir : contour). Une étape faite se rouvre avec `onSelect`.
 */
export function StepsAside({
  title,
  subtitle,
  steps,
  current,
  onSelect,
}: {
  title: string
  subtitle?: string
  steps: string[]
  /** Index de l'étape en cours (0 = première). */
  current: number
  onSelect?: (index: number) => void
}) {
  return (
    <View
      style={{
        flex: 1,
        padding: 56,
        gap: 40,
        justifyContent: 'space-between',
        backgroundColor: colors.ink,
      }}
    >
      <Brand onDark size={36} fontSize={24} />
      <View style={{ gap: 18 }}>
        <Text
          role="heading"
          style={{
            ...font('display'),
            fontSize: 64,
            lineHeight: 62,
            textTransform: 'uppercase',
            color: colors.white,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ ...font('body', 400), fontSize: 18, lineHeight: 27, color: colors.line }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ gap: 10 }}>
        {steps.map((label, i) => (
          <AsideStep
            key={label}
            n={i + 1}
            label={label}
            state={i < current ? 'done' : i === current ? 'current' : 'todo'}
            onPress={i < current && onSelect ? () => onSelect(i) : undefined}
          />
        ))}
      </View>
    </View>
  )
}

function AsideStep({
  n,
  label,
  state,
  onPress,
}: {
  n: number
  label: string
  state: 'done' | 'current' | 'todo'
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const bg = state === 'done' ? colors.venue : state === 'current' ? colors.rating : colors.ink
  const reached = state !== 'todo'
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      aria-current={state === 'current' ? 'step' : undefined}
      {...hoverProps}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: border.base,
          borderColor: reached ? colors.white : colors.muted,
          borderRadius: radius.field,
          backgroundColor: bg,
        }}
      >
        <Text
          style={{ ...font('display'), fontSize: 16, color: reached ? textOn(bg) : colors.white }}
        >
          {n}
        </Text>
      </View>
      <Text
        style={{
          ...font('body', state === 'current' ? 800 : 600),
          fontSize: 17,
          color: !reached ? colors.inkMuted : onPress && hovered ? colors.rating : colors.white,
          ...transition(['color']),
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
