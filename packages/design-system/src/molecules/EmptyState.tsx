import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { border, colors, font, radius } from '../tokens'

export function EmptyState({
  icon,
  tint = colors.ratingSoft,
  title,
  text,
  action,
  dashed,
}: {
  icon: ReactNode
  tint?: string
  title: string
  text: string
  action?: ReactNode
  /** Rien à montrer dans une liste : bordure en pointillés, sans fond. */
  dashed?: boolean
}) {
  return (
    <View
      style={{
        backgroundColor: dashed ? 'transparent' : colors.white,
        borderWidth: border.base,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: colors.ink,
        borderRadius: radius.card,
        paddingVertical: 22,
        paddingHorizontal: 18,
        alignItems: 'center',
        gap: 10,
      }}
    >
      <View
        style={{
          transform: [{ rotate: '-6deg' }],
          width: 56,
          height: 56,
          borderRadius: 10,
          backgroundColor: tint,
          borderWidth: border.thin,
          borderColor: colors.ink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text style={{ ...font('body', 800), fontSize: 16, textAlign: 'center', color: colors.ink }}>
        {title}
      </Text>
      <Text
        style={{
          ...font('body', 400),
          fontSize: 13,
          lineHeight: 19,
          textAlign: 'center',
          color: colors.muted,
        }}
      >
        {text}
      </Text>
      {action}
    </View>
  )
}
