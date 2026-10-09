import { Text, View } from 'react-native'
import { TextLink } from '../atoms/TextLink'
import { border, colors, dark, font, radius, semantic } from '../tokens'

export type PairingStatus = 'live' | 'pending' | 'done' | 'disputed' | 'bye'
const statuses: Record<PairingStatus, { label: string; bg: string }> = {
  live: { label: 'En cours', bg: colors.white },
  pending: { label: 'À confirmer', bg: colors.ratingSoft },
  done: { label: 'Validé', bg: colors.venueSoft },
  disputed: { label: 'Contesté', bg: colors.roomSoft },
  bye: { label: 'Bye', bg: semantic.neutralSoft },
}

/** Pastille de statut d'un appariement. */
export function PairingStatusPill({ status }: { status: PairingStatus }) {
  const s = statuses[status]
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: s.bg,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.pill,
        paddingVertical: 2,
        paddingHorizontal: 9,
      }}
    >
      <Text style={{ ...font('body', 700), fontSize: 11, color: colors.ink }}>{s.label}</Text>
    </View>
  )
}

/**
 * Appariement d'une ronde : table, deux joueurs, score et statut.
 * `list` : téléphone ; `orga` : tableau de l'orga (web) avec action ; `tv` : écran de salle, sombre.
 */
export function PairingRow({
  table,
  a,
  b,
  score,
  status,
  action,
  variant = 'list',
  odd,
}: {
  table: number | string
  a: string
  /** Absent : bye. */
  b?: string
  score?: string
  status: PairingStatus
  action?: { label: string; onPress: () => void }
  variant?: 'list' | 'orga' | 'tv'
  /** Écran TV : une ligne sur deux plus claire. */
  odd?: boolean
}) {
  const label = `Table ${table} : ${a}${b ? ` contre ${b}` : ', bye'}${score ? `, ${score}` : ''}, ${statuses[status].label}`

  if (variant === 'tv') {
    return (
      <View
        aria-label={label}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 24,
          paddingVertical: 14,
          paddingHorizontal: 24,
          backgroundColor: odd ? dark.card : colors.ink,
          borderWidth: border.base,
          borderColor: colors.white,
          borderRadius: radius.card,
        }}
      >
        <Text style={{ width: 80, ...font('display'), fontSize: 40, color: colors.rating }}>
          {table}
        </Text>
        <Text
          numberOfLines={1}
          style={{ flex: 1, ...font('body', 800), fontSize: 32, color: colors.white }}
        >
          {a}
        </Text>
        <Text style={{ ...font('mono', 400), fontSize: 24, color: dark.muted }}>
          {score ?? 'vs'}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            ...font('body', 800),
            fontSize: 32,
            color: colors.white,
            textAlign: 'right',
          }}
        >
          {b ?? 'Bye'}
        </Text>
      </View>
    )
  }

  const orga = variant === 'orga'
  return (
    <View
      aria-label={label}
      style={{
        flexDirection: orga ? 'row' : 'column',
        alignItems: orga ? 'center' : 'stretch',
        gap: orga ? 16 : 8,
        paddingVertical: orga ? 12 : 8,
        paddingHorizontal: orga ? 16 : 10,
        backgroundColor: colors.white,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.field,
      }}
    >
      <View
        style={{
          flex: orga ? 1 : undefined,
          flexDirection: 'row',
          alignItems: 'center',
          gap: orga ? 16 : 8,
        }}
      >
        <Text
          style={{ width: orga ? 70 : 36, ...font('display'), fontSize: 18, color: colors.ink }}
        >
          {table}
        </Text>
        <Text
          numberOfLines={1}
          style={{ flex: 1, ...font('body', 800), fontSize: orga ? 14 : 13, color: colors.ink }}
        >
          {a}
        </Text>
        <Text
          style={{
            width: orga ? 120 : 46,
            textAlign: 'center',
            ...font('mono', 700),
            fontSize: orga ? 16 : 13,
            color: colors.ink,
          }}
        >
          {score ?? '–'}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            ...font('body', 800),
            fontSize: orga ? 14 : 13,
            color: b ? colors.ink : colors.muted,
          }}
        >
          {b ?? 'Bye'}
        </Text>
      </View>
      <View style={{ width: orga ? 170 : undefined }}>
        <PairingStatusPill status={status} />
      </View>
      {orga ? (
        <View style={{ width: 150, alignItems: 'flex-end' }}>
          {action ? <TextLink label={action.label} onPress={action.onPress} /> : null}
        </View>
      ) : null}
    </View>
  )
}
