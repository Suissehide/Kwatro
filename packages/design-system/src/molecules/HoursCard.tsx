import { Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius, shadow } from '../tokens'

export type HoursRow = { day: string; value: string; closed?: boolean; today?: boolean }

/**
 * Horaires de la semaine ; aujourd'hui surligné, « Fermé » en rouge. Avec `title`, en-tête dans la carte ;
 * `plain` : simple liste, sans cadre ni surlignage (dans une fiche).
 */
export function HoursCard({
  rows,
  title,
  status,
  statusColor = colors.muted,
  plain,
}: {
  rows: HoursRow[]
  title?: string
  status?: string
  statusColor?: string
  plain?: boolean
}) {
  if (plain)
    return (
      <View style={{ gap: 6 }}>
        {rows.map((row) => (
          <View
            key={row.day}
            style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}
          >
            <Text style={{ ...font('body', 800), fontSize: 13, color: colors.ink }}>{row.day}</Text>
            <Text
              style={{
                ...font('mono', 400),
                fontSize: 13,
                textAlign: 'right',
                color: row.closed ? colors.room : colors.ink,
              }}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    )
  const card = (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      {title ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingTop: 16,
            paddingBottom: 10,
            paddingHorizontal: 18,
          }}
        >
          <Typography variant="h2">{title}</Typography>
          {status ? (
            <Text style={{ ...font('mono', 700), fontSize: 12, color: statusColor }}>{status}</Text>
          ) : null}
        </View>
      ) : null}
      {rows.map((row, i) => (
        <View
          key={row.day}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 9,
            paddingHorizontal: title ? 18 : 14,
            backgroundColor: row.today ? colors.ratingSoft : colors.white,
            borderTopWidth: title || i ? border.thin : 0,
            borderColor: colors.line,
          }}
        >
          <Text style={{ ...font('body', row.today ? 800 : 600), fontSize: 14, color: colors.ink }}>
            {row.today ? `${row.day} · aujourd'hui` : row.day}
          </Text>
          <Text
            style={{
              ...font('mono', row.today ? 700 : 400),
              flexShrink: 1,
              fontSize: title ? 13 : 12,
              textAlign: 'right',
              color: row.closed ? colors.room : colors.ink,
            }}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  )
  return title ? <Raised offset={shadow.card}>{card}</Raised> : card
}
