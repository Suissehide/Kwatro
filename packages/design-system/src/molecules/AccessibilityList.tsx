import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font, semantic } from '../tokens'
import { ListCard } from './ListCard'

export type AccessibilityStatus = 'yes' | 'no' | 'info'
const marks: Record<AccessibilityStatus, { mark: string; bg: string; fg: string; name: string }> = {
  yes: { mark: '✓', bg: colors.venue, fg: colors.white, name: 'Oui' },
  no: { mark: '✕', bg: semantic.dangerSoft, fg: colors.ink, name: 'Non' },
  info: { mark: 'i', bg: semantic.warningSoft, fg: colors.ink, name: 'Info' },
}

/** Accès et accessibilité d'un lieu : case ✓ / ✕ / i, libellé et note. Deux colonnes avec `columns={2}`. */
export function AccessibilityList({
  items,
  columns = 1,
}: {
  items: { label: string; note?: string | null; status: AccessibilityStatus }[]
  columns?: 1 | 2
}) {
  return (
    <ListCard>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {items.map((item, i) => {
          const m = marks[item.status]
          return (
            <View
              key={item.label}
              aria-label={`${item.label} : ${m.name}`}
              style={{
                width: columns === 2 ? '50%' : '100%',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
                paddingVertical: columns === 2 ? 14 : 12,
                paddingHorizontal: columns === 2 ? 18 : 14,
                borderTopWidth: i >= columns ? border.thin : 0,
                borderLeftWidth: i % columns ? border.thin : 0,
                borderColor: colors.line,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: border.thin,
                  borderColor: colors.ink,
                  borderRadius: 6,
                  backgroundColor: m.bg,
                }}
              >
                <Text style={{ ...font('body', 800), fontSize: 13, color: m.fg }}>{m.mark}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>
                  {item.label}
                </Text>
                {item.note ? <Typography variant="small">{item.note}</Typography> : null}
              </View>
            </View>
          )
        })}
      </View>
    </ListCard>
  )
}
