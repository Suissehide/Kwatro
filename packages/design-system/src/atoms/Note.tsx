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

export function Note({ children, tone = 'kwote' }: { children: ReactNode; tone?: NoteTone }) {
  return (
    <View
      style={{
        backgroundColor: bg[tone],
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ ...font('body', 600), fontSize: 13, lineHeight: 19, color: colors.ink }}>
        {children}
      </Text>
    </View>
  )
}
