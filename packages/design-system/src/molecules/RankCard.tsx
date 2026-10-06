import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius, semantic } from '../tokens'
import { RatingBadge } from './RatingBadge'

type Rank = {
  /** Couleur du jeu (bandeau ou liseré). */
  color: string
  game: string
  format: string
  /** null : LK provisoires, `progress` affiche alors « 3 / 5 ». */
  rating: string | null
  progress?: string
  /** « 38 parties classées », ou ce qu'il reste avant les premiers LK. */
  note: string
}

function Provisional() {
  return (
    <View
      style={{
        backgroundColor: semantic.neutralSoft,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.pill,
        paddingVertical: 2,
        paddingHorizontal: 8,
      }}
    >
      <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.ink }}>Provisoire</Text>
    </View>
  )
}

function Score({
  rating,
  progress,
  large,
}: Pick<Rank, 'rating' | 'progress'> & { large?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {rating ? <RatingBadge value={rating} large={large} /> : <Provisional />}
      {!rating && progress ? (
        <Text style={{ ...font('mono', 700), fontSize: 13, color: colors.muted }}>{progress}</Text>
      ) : null}
    </View>
  )
}

/** LK d'un format TCG, en carte (profil web). */
export function RankCard({ color, game, format, rating, progress, note }: Rank) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: 8,
          backgroundColor: color,
          borderBottomWidth: border.base,
          borderColor: colors.ink,
        }}
      />
      <View style={{ padding: 16, gap: 8 }}>
        <Typography variant="label">{format}</Typography>
        <Typography variant="title">{game}</Typography>
        <Score rating={rating} progress={progress} large />
        <Typography variant="small">{note}</Typography>
      </View>
    </View>
  )
}

/** LK d'un format TCG, en ligne de liste (profil téléphone). */
export function RankRow({
  color,
  game,
  format,
  rating,
  progress,
  note,
  last,
}: Rank & { last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingRight: 14,
        borderBottomWidth: last ? 0 : border.thin,
        borderColor: colors.line,
      }}
    >
      <View
        style={{ width: 8, alignSelf: 'stretch', marginVertical: -12, backgroundColor: color }}
      />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Typography variant="title">{game}</Typography>
        <Typography variant="small">
          {format} · {note}
        </Typography>
      </View>
      <Score rating={rating} progress={progress} />
    </View>
  )
}
