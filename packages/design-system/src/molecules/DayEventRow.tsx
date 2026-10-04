import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, transition } from '../tokens'

/** Événement dans le panneau du jour d'un calendrier : liseré coloré, horaire, titre, places, action. */
export function DayEventRow({
  color,
  label,
  title,
  meta,
  metaAlert,
  action,
  onPress,
}: {
  color: string
  label: string
  title: string
  meta: string
  metaAlert?: boolean
  action?: ReactNode
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      role="link"
      aria-label={title}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderTopWidth: border.thin,
        borderColor: colors.line,
        backgroundColor: hovered && onPress ? colors.hover : colors.white,
        ...transition(['background-color']),
      }}
    >
      <View
        style={{
          width: 8,
          alignSelf: 'stretch',
          borderRadius: radius.tag,
          borderWidth: border.thin,
          borderColor: colors.ink,
          backgroundColor: color,
        }}
      />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Typography variant="label">{label}</Typography>
        <Text style={{ ...font('body', 800), fontSize: 15, lineHeight: 19, color: colors.ink }}>
          {title}
        </Text>
        <Text
          style={{
            ...font('mono', 700),
            fontSize: 12,
            color: metaAlert ? colors.room : colors.muted,
          }}
        >
          {meta}
        </Text>
      </View>
      {action}
    </Pressable>
  )
}
