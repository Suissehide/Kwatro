import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius, semantic } from '../tokens'
import { KwoteBadge } from './KwoteBadge'

type Rank = {
  /** Couleur du jeu (bandeau ou liseré). */
  color: string
  game: string
  format: string
  /** null : Kwote provisoire, `progress` affiche alors « 3 / 5 ». */
  kwote: string | null
  progress?: string
  /** « 38 parties classées », ou ce qu'il reste avant la première Kwote. */
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

function Score({ kwote, progress, large }: Pick<Rank, 'kwote' | 'progress'> & { large?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {kwote ? <KwoteBadge value={kwote} large={large} /> : <Provisional />}
      {!kwote && progress ? (
        <Text style={{ ...font('mono', 700), fontSize: 13, color: colors.muted }}>{progress}</Text>
      ) : null}
    </View>
  )
}

/** Kwote d'un format TCG, en carte (profil web). */
export function RankCard({ color, game, format, kwote, progress, note }: Rank) {
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
        <Score kwote={kwote} progress={progress} large />
        <Typography variant="small">{note}</Typography>
      </View>
    </View>
  )
}

/** Kwote d'un format TCG, en ligne de liste (profil téléphone). */
export function RankRow({
  color,
  game,
  format,
  kwote,
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
      <Score kwote={kwote} progress={progress} />
    </View>
  )
}
