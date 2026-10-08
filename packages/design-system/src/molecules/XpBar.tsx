import { Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

type XpStyle = {
  /** `inverse` : sur la carte bleue de la page Progression (texte blanc, remplissage jaune). */
  tone?: 'default' | 'inverse'
  /** `lg` : piste de 22 px. */
  size?: 'md' | 'lg'
}

/** Niveau d'XP : assiduité. Toujours une barre + nom de palier. Ne doit jamais ressembler aux LK. */
export function XpBar({
  level,
  name,
  current,
  max,
  tone = 'default',
  size,
}: {
  level: number
  name: string
  current: number
  max: number
} & XpStyle) {
  const inverse = tone === 'inverse'
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{ ...font('body', 800), fontSize: 13, color: inverse ? colors.white : colors.ink }}
        >
          Niv. {level} · {name}
        </Text>
        <Text
          style={{
            ...font('mono', 400),
            fontSize: 13,
            color: inverse ? colors.white : colors.muted,
          }}
        >
          {current} / {max} XP
        </Text>
      </View>
      <XpTrack current={current} max={max} tone={tone} size={size} />
    </View>
  )
}

/** Barre d'XP seule (16 px, remplissage event ; 22 px en `lg`, jaune en `inverse`). */
export function XpTrack({
  current,
  max,
  tone = 'default',
  size = 'md',
}: { current: number; max: number } & XpStyle) {
  const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0
  return (
    <View
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      style={{
        height: size === 'lg' ? 22 : 16,
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
          backgroundColor: tone === 'inverse' ? colors.rating : colors.event,
          borderRightWidth: percent > 0 ? border.base : 0,
          borderColor: colors.ink,
        }}
      />
    </View>
  )
}
