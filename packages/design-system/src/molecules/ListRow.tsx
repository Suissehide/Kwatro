import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { border, colors, font, sizes } from '../tokens'

export function ListRow({
  left,
  title,
  subtitle,
  right,
  last,
  onPress,
}: {
  left?: ReactNode
  title: string
  subtitle?: string
  right?: ReactNode
  last?: boolean
  onPress?: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      role={onPress ? 'button' : undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: sizes.rowComfort,
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : border.thin,
        borderColor: colors.line,
      }}
    >
      {left}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text numberOfLines={1} style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{ ...font('body', 400), fontSize: 13, color: colors.muted }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  )
}
