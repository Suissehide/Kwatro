import { Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

/** Niveau d'XP : assiduité. Toujours une barre bleue + nom de palier. Ne doit jamais ressembler aux LK. */
export function XpBar({
  level,
  name,
  current,
  max,
}: {
  level: number
  name: string
  current: number
  max: number
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ ...font('body', 800), fontSize: 13, color: colors.ink }}>
          Niv. {level} · {name}
        </Text>
        <Text style={{ ...font('mono', 400), fontSize: 13, color: colors.muted }}>
          {current} / {max} XP
        </Text>
      </View>
      <XpTrack current={current} max={max} />
    </View>
  )
}

/** Barre d'XP seule (16 px, remplissage event). */
export function XpTrack({ current, max }: { current: number; max: number }) {
  const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0
  return (
    <View
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      style={{
        height: 16,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: 99,
        backgroundColor: colors.white,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: colors.event,
          borderRightWidth: percent > 0 ? border.base : 0,
          borderColor: colors.ink,
        }}
      />
    </View>
  )
}
