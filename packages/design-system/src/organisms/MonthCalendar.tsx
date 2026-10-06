import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, sizes, transition, type } from '../tokens'

export type CalendarDay = {
  /** Clé stable, ex. la date « 2026-10-03 ». */
  key: string
  /** null : case hors du mois. */
  day: number | null
  today?: boolean
  past?: boolean
  /** Lieu fermé ce jour-là : fond hachuré. */
  closed?: boolean
  /** Fermeture exceptionnelle : « Fermé » écrit dans la case (grand format). */
  closedLabel?: string
  items: { label: string; color: string }[]
}

// Colonnes égales malgré les bordures et marges internes des cases (flex: 1 les répartit mal)
const COLUMN = `${100 / 7}%` as const

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

/**
 * Mois en grille de 7 colonnes, lundi en premier. Grand format : jusqu'à 2 étiquettes par jour puis « +N » ;
 * `compact` (téléphone) : jusqu'à 3 points. Sous la grille, le panneau du jour sélectionné :
 * `dayTitle`, légende (grand format) et les lignes passées en `children`, ou `emptyText`.
 */
export function MonthCalendar({
  title,
  days,
  selected,
  onSelect,
  onPrev,
  onNext,
  compact,
  dayTitle,
  legend = [],
  emptyText,
  children,
}: {
  title: string
  days: CalendarDay[]
  selected: string
  onSelect: (key: string) => void
  /** Absent : flèche désactivée (borne de l'agenda). */
  onPrev?: () => void
  onNext?: () => void
  compact?: boolean
  dayTitle: string
  legend?: { label: string; color: string }[]
  emptyText?: string | null
  children?: ReactNode
}) {
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, w) =>
    days.slice(w * 7, w * 7 + 7),
  )
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: compact ? 10 : 12,
          paddingHorizontal: compact ? 12 : 16,
          borderBottomWidth: border.base,
          borderColor: colors.ink,
        }}
      >
        <Arrow label="Mois précédent" icon={ChevronLeft} onPress={onPrev} compact={compact} />
        <Text
          style={{
            ...font('display'),
            fontSize: compact ? 17 : 20,
            textTransform: 'uppercase',
            color: colors.ink,
          }}
        >
          {title}
        </Text>
        <Arrow label="Mois suivant" icon={ChevronRight} onPress={onNext} compact={compact} />
      </View>
      <View style={compact ? { paddingTop: 6, paddingBottom: 8, paddingHorizontal: 6 } : null}>
        <View style={{ flexDirection: 'row' }}>
          {WEEKDAYS.map((d) => (
            <Text
              key={d}
              style={[
                type.label,
                compact
                  ? { width: COLUMN, textAlign: 'center', paddingTop: 4, paddingBottom: 6 }
                  : {
                      width: COLUMN,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderBottomWidth: border.thin,
                      borderColor: colors.line,
                    },
              ]}
            >
              {compact ? d.charAt(0) : d}
            </Text>
          ))}
        </View>
        {weeks.map((week, w) => (
          <View key={week[0]?.key ?? w} style={{ flexDirection: 'row' }}>
            {week.map((d, i) => (
              <Day
                key={d.key}
                d={d}
                selected={d.key === selected}
                compact={compact}
                first={{ row: w === 0, col: i === 0 }}
                onPress={() => onSelect(d.key)}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={{ borderTopWidth: border.base, borderColor: colors.ink }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            paddingTop: 12,
            paddingBottom: compact ? 10 : 12,
            paddingHorizontal: compact ? 14 : 16,
          }}
        >
          <Text style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>{dayTitle}</Text>
          {compact ? null : (
            <View style={{ flexDirection: 'row', gap: 14 }}>
              {legend.map((l) => (
                <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderWidth: 1.5,
                      borderColor: colors.ink,
                      borderRadius: 3,
                      backgroundColor: l.color,
                    }}
                  />
                  <Typography variant="label">{l.label}</Typography>
                </View>
              ))}
            </View>
          )}
        </View>
        {children}
        {emptyText ? (
          <Typography
            variant="small"
            style={{ paddingHorizontal: compact ? 14 : 16, paddingBottom: 14 }}
          >
            {emptyText}
          </Typography>
        ) : null}
      </View>
    </View>
  )
}

function Arrow({
  label,
  icon: Icon,
  onPress,
  compact,
}: {
  label: string
  icon: LucideIcon
  onPress?: () => void
  compact?: boolean
}) {
  const { hovered, hoverProps } = useHover()
  const size = compact ? sizes.touch : sizes.buttonSm
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={!onPress}
      disabled={!onPress}
      onPress={onPress}
      {...hoverProps}
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 9,
        backgroundColor: hovered && onPress ? colors.hover : colors.white,
        opacity: onPress ? 1 : 0.3,
        ...transition(['background-color']),
      }}
    >
      <Icon size={18} color={colors.ink} strokeWidth={2.5} />
    </Pressable>
  )
}

// Hachures des jours de fermeture sur le web (CSS passé tel quel par react-native-web), aplat ailleurs
const HATCH = (
  Platform.OS === 'web'
    ? {
        backgroundImage: `repeating-linear-gradient(135deg, ${colors.white} 0 6px, ${colors.hatch} 6px 12px)`,
      }
    : { backgroundColor: colors.hatch }
) as Record<never, never>

function Day({
  d,
  selected,
  compact,
  first,
  onPress,
}: {
  d: CalendarDay
  selected: boolean
  compact?: boolean
  first: { row: boolean; col: boolean }
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  if (d.day === null) {
    return (
      <View
        style={{
          width: COLUMN,
          minHeight: compact ? 46 : 96,
          backgroundColor: compact ? colors.white : colors.creamPale,
          borderTopWidth: compact || first.row ? 0 : border.thin,
          borderLeftWidth: compact || first.col ? 0 : border.thin,
          borderColor: colors.line,
        }}
      />
    )
  }
  const bg = selected ? colors.kwoteSoft : hovered ? colors.hover : colors.white
  const fade = d.past ? 0.55 : 1
  const number = (
    <View
      style={{
        minWidth: compact ? 26 : 24,
        height: compact ? 26 : 24,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: d.today ? colors.ink : 'transparent',
        opacity: fade,
      }}
    >
      <Text
        style={{
          ...font('mono', 700),
          fontSize: compact ? 13 : 12,
          color: d.today ? colors.white : colors.ink,
        }}
      >
        {d.day}
      </Text>
    </View>
  )
  return (
    <Pressable
      role="button"
      aria-label={`${d.day}${d.closed ? ', fermé' : ''}${d.items.length ? `, ${d.items.length} événement${d.items.length > 1 ? 's' : ''}` : ''}`}
      aria-selected={selected}
      onPress={onPress}
      {...hoverProps}
      style={[
        {
          width: COLUMN,
          minWidth: 0,
          backgroundColor: bg,
          ...transition(['background-color']),
        },
        d.closed && !selected && !hovered ? HATCH : null,
        compact
          ? {
              height: 46,
              // Bordure blanche plutôt qu'une marge : écart entre les cases sans déborder des 7 colonnes
              borderWidth: 1,
              borderColor: colors.white,
              borderRadius: radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }
          : {
              minHeight: 96,
              padding: 6,
              paddingBottom: 8,
              gap: 4,
              borderTopWidth: first.row ? 0 : border.thin,
              borderLeftWidth: first.col ? 0 : border.thin,
              borderColor: colors.line,
            },
      ]}
    >
      {compact ? (
        <>
          {number}
          <View style={{ flexDirection: 'row', gap: 3, height: 6, opacity: fade }}>
            {d.items.slice(0, 3).map((it, i) => (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: points sans identité, ordre stable
                key={i}
                style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: it.color }}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {number}
            {d.closedLabel ? (
              <Text
                style={{
                  ...font('mono', 700),
                  fontSize: 9,
                  textTransform: 'uppercase',
                  color: colors.room,
                  opacity: fade,
                }}
              >
                {d.closedLabel}
              </Text>
            ) : null}
          </View>
          {d.items.slice(0, 2).map((it, i) => (
            <Text
              // biome-ignore lint/suspicious/noArrayIndexKey: deux titres identiques possibles le même jour
              key={i}
              numberOfLines={1}
              style={{
                ...font('body', 700),
                fontSize: 11,
                lineHeight: 14,
                color: colors.white,
                backgroundColor: it.color,
                borderWidth: 1.5,
                borderColor: colors.ink,
                borderRadius: radius.tag,
                paddingVertical: 2,
                paddingHorizontal: 5,
                opacity: fade,
              }}
            >
              {it.label}
            </Text>
          ))}
          {d.items.length > 2 ? (
            <Text style={{ ...font('mono', 700), fontSize: 11, color: colors.muted }}>
              +{d.items.length - 2}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  )
}
