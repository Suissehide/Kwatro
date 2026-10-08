import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { border, colors, font, radius } from '../tokens'

/** Ligne à liseré coloré (événement d'un lieu) : titre, détail, étiquettes et actions à droite. */
export function StripeRow({
  stripe,
  title,
  subtitle,
  tags,
  actions,
}: {
  stripe: string
  title: string
  subtitle: string
  tags?: ReactNode
  actions?: ReactNode
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.sm,
        backgroundColor: colors.white,
        overflow: 'hidden',
      }}
    >
      <View style={{ width: 6, backgroundColor: stripe }} />
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
      >
        <View style={{ flex: 1, minWidth: 180, gap: 2 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <Text style={{ ...font('body', 800), fontSize: 14, color: colors.ink }}>{title}</Text>
            {tags}
          </View>
          <Text style={{ ...font('body', 400), fontSize: 12, color: colors.muted }}>
            {subtitle}
          </Text>
        </View>
        {actions ? <View style={{ flexDirection: 'row', gap: 6 }}>{actions}</View> : null}
      </View>
    </View>
  )
}
