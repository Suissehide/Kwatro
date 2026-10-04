import { Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius, shadow } from '../tokens'
import { XpTrack } from './XpBar'

/** Carte « Niveau Kwatro » du profil web : palier, XP du niveau et ce qu'il reste pour le suivant. */
export function LevelCard({
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
    <Raised offset={shadow.card} r={radius.card}>
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          paddingVertical: 16,
          paddingHorizontal: 18,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="label">Niveau Kwatro</Typography>
          <Text style={{ ...font('mono', 700), fontSize: 13, color: colors.ink }}>
            {current} / {max} XP
          </Text>
        </View>
        <Typography variant="h1">
          Niv. {level} · {name}
        </Typography>
        <XpTrack current={current} max={max} />
        <Typography variant="small">
          Encore {max - current} XP pour le niveau {level + 1}.
        </Typography>
      </View>
    </Raised>
  )
}
