import type { LucideIcon } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

export type NoteTone = 'kwote' | 'room' | 'venue' | 'plain'
const bg: Record<NoteTone, string> = {
  kwote: colors.kwoteSoft, // info
  room: colors.roomSoft, // blocage
  venue: colors.venueSoft, // avantage
  plain: colors.white,
}

export function Note({
  children,
  tone = 'kwote',
  icon: Icon,
}: {
  children: ReactNode
  tone?: NoteTone
  /** Icône Lucide avant le texte (ex. message épinglé). */
  icon?: LucideIcon
}) {
  return (
    <View
      style={{
        backgroundColor: bg[tone],
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      {Icon ? (
        <Icon size={16} color={colors.ink} strokeWidth={2.5} style={{ marginTop: 1 }} />
      ) : null}
      <Text
        style={{ flex: 1, ...font('body', 600), fontSize: 13, lineHeight: 19, color: colors.ink }}
      >
        {children}
      </Text>
    </View>
  )
}
