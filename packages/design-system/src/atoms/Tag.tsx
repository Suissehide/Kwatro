import type { LucideIcon } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { border, colors, font, radius } from '../tokens'

export type TagVariant = 'default' | 'ranked' | 'partner' | 'tonight' | 'event' | 'pinned' | 'alert'
const variants: Record<TagVariant, { bg: string; fg: string; rotate: number }> = {
  default: { bg: colors.white, fg: colors.ink, rotate: 0 },
  ranked: { bg: colors.ink, fg: colors.white, rotate: 0 },
  // Partenaire : toujours visible (exigence de classement honnête)
  partner: { bg: colors.venue, fg: colors.white, rotate: -3 },
  tonight: { bg: colors.rating, fg: colors.ink, rotate: 2 },
  event: { bg: colors.event, fg: colors.white, rotate: 0 },
  alert: { bg: colors.room, fg: colors.white, rotate: 0 },
  pinned: { bg: colors.rating, fg: colors.ink, rotate: 0 },
}

export function Tag({
  label,
  variant = 'default',
  icon: Icon,
}: {
  label: string
  variant?: TagVariant
  icon?: LucideIcon
}) {
  const v = variants[variant]
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: v.bg,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.tag,
        paddingVertical: 3,
        paddingHorizontal: 7,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        transform: [{ rotate: `${v.rotate}deg` }],
      }}
    >
      {Icon ? <Icon size={11} color={v.fg} strokeWidth={2.5} /> : null}
      <Text style={{ ...font('mono', 700), fontSize: 11, textTransform: 'uppercase', color: v.fg }}>
        {label}
      </Text>
    </View>
  )
}
