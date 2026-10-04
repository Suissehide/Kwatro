import { Pressable, Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, transition } from '../tokens'

export type SettingsRowData = { label: string; value?: string; onPress?: () => void }

/** Groupe de réglages : libellé puis carte de lignes ; chevron sur les lignes qui ouvrent quelque chose. */
export function SettingsGroup({ title, rows }: { title: string; rows: SettingsRowData[] }) {
  return (
    <View style={{ gap: 8, marginTop: 8 }}>
      <Typography variant="label">{title}</Typography>
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          overflow: 'hidden',
        }}
      >
        {rows.map((row, i) => (
          <SettingsRow key={row.label} {...row} first={i === 0} />
        ))}
      </View>
    </View>
  )
}

function SettingsRow({ label, value, onPress, first }: SettingsRowData & { first: boolean }) {
  const { hovered, hoverProps } = useHover()
  const muted = { ...font('body', 400), fontSize: 13, color: colors.muted }
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      role={onPress ? 'link' : undefined}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 52,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderTopWidth: first ? 0 : border.thin,
        borderColor: colors.line,
        backgroundColor: onPress && hovered ? colors.hover : 'transparent',
        ...transition(['background-color']),
      }}
    >
      <Text style={{ flex: 1, ...font('body', 600), fontSize: 15, color: colors.ink }}>
        {label}
      </Text>
      {value ? (
        <Text numberOfLines={1} style={{ ...muted, flexShrink: 1 }}>
          {value}
        </Text>
      ) : null}
      {onPress ? (
        <Text style={{ ...font('body', 800), fontSize: 15, color: colors.muted }}>›</Text>
      ) : null}
    </Pressable>
  )
}
