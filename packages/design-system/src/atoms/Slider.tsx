import { useRef, useState } from 'react'
import { PanResponder, Platform, View, type ViewProps } from 'react-native'
import { border, colors, radius } from '../tokens'
import { Raised } from './Raised'

const THUMB = 28

/** Curseur : piste remplie en `color` jusqu'à la valeur, poignée kwote. Glisser, toucher la piste ou flèches du clavier. */
export function Slider({
  value,
  min,
  max,
  step = 1,
  label,
  color = colors.venue,
  onChange,
}: {
  value: number
  min: number
  max: number
  step?: number
  label: string
  color?: string
  onChange: (value: number) => void
}) {
  const [width, setWidth] = useState(0)
  const track = useRef<View>(null)
  // Bord gauche de la piste à l'écran, mesuré à chaque appui (null tant que la mesure n'est pas revenue)
  const origin = useRef<number | null>(null)
  const lastX = useRef(0)
  // Le PanResponder est créé une fois : il lit la valeur et les bornes courantes via cette ref
  const props = useRef({ value, min, max, step, width, onChange })
  props.current = { value, min, max, step, width, onChange }

  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const fromPageX = (pageX: number) => {
    lastX.current = pageX
    if (origin.current === null) return
    const p = props.current
    const ratio = Math.min(1, Math.max(0, (pageX - origin.current - THUMB / 2) / (p.width - THUMB)))
    const next = Math.round((p.min + ratio * (p.max - p.min)) / p.step) * p.step
    if (next !== p.value) p.onChange(next)
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        origin.current = null
        lastX.current = e.nativeEvent.pageX
        track.current?.measure((_x, _y, _w, _h, left) => {
          origin.current = left
          fromPageX(lastX.current)
        })
      },
      onPanResponderMove: (_e, g) => fromPageX(g.moveX),
    }),
  ).current

  const ratio = max > min ? (clamp(value) - min) / (max - min) : 0
  const thumbLeft = ratio * Math.max(0, width - THUMB)
  // Web : focus clavier et flèches (react-native-web transmet tabIndex et onKeyDown à la div)
  const keyboard =
    Platform.OS === 'web'
      ? ({
          tabIndex: 0,
          onKeyDown: (e: { key: string; preventDefault: () => void }) => {
            const delta = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[
              e.key
            ]
            if (delta === undefined) return
            e.preventDefault()
            onChange(clamp(value + delta))
          },
        } as ViewProps)
      : null

  return (
    <View
      ref={track}
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onChange(clamp(value + (e.nativeEvent.actionName === 'increment' ? step : -step)))
      }
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      {...keyboard}
      {...pan.panHandlers}
      style={[
        { height: THUMB + 4, justifyContent: 'center' },
        Platform.OS === 'web' ? ({ cursor: 'pointer', touchAction: 'none' } as object) : null,
      ]}
    >
      <View
        style={{
          height: 16,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.pill,
          backgroundColor: colors.white,
          overflow: 'hidden',
        }}
      >
        <View style={{ width: thumbLeft + THUMB / 2, height: '100%', backgroundColor: color }} />
      </View>
      <Raised
        offset={2}
        r={THUMB / 2}
        style={{ position: 'absolute', left: thumbLeft, top: 1, width: THUMB, height: THUMB }}
      >
        <View
          style={{
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            backgroundColor: colors.kwote,
            borderWidth: border.base,
            borderColor: colors.ink,
          }}
        />
      </Raised>
    </View>
  )
}
