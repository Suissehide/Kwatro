import { Check, Equal, TimerOff } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { Raised } from '../atoms/Raised'
import { Tag } from '../atoms/Tag'
import { border, colors, font, radius, shadow } from '../tokens'

export type ScanStatus = 'ok' | 'duplicate' | 'expired'
const statuses = {
  ok: { title: 'Venue validée', bg: colors.venue, fg: colors.white, icon: Check },
  duplicate: { title: 'Déjà scannée', bg: colors.rating, fg: colors.ink, icon: Equal },
  expired: { title: 'Code expiré', bg: colors.room, fg: colors.white, icon: TimerOff },
} as const

/** Résultat d'un scan de QR côté lieu. Le retour haptique (succès / avertissement) est fait par l'écran. */
export function ScanResult({
  status,
  player,
  body,
  perk,
}: {
  status: ScanStatus
  player?: {
    pseudo: string
    level: number
    visits: number
    minor?: boolean
    avatarUri?: string | null
  }
  body: string
  /** Avantage à appliquer au comptoir. */
  perk?: string
}) {
  const s = statuses[status]
  const Icon = s.icon
  return (
    <Raised offset={shadow.card}>
      <View
        role="alert"
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
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: s.bg,
            borderBottomWidth: border.base,
            borderColor: colors.ink,
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              borderWidth: border.thin,
              borderColor: colors.ink,
              backgroundColor: colors.white,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={16} color={colors.ink} strokeWidth={3} />
          </View>
          <Text
            style={{ ...font('display'), fontSize: 20, textTransform: 'uppercase', color: s.fg }}
          >
            {s.title}
          </Text>
        </View>
        <View style={{ padding: 16, gap: 12 }}>
          {player ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={player.pseudo} uri={player.avatarUri} size={44} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ ...font('body', 800), fontSize: 16, color: colors.ink }}>
                  {player.pseudo}
                </Text>
                <Text style={{ ...font('body', 400), fontSize: 13, color: colors.muted }}>
                  Niv. {player.level} · {player.visits}
                  {player.visits === 1 ? 're' : 'ᵉ'} visite chez vous
                </Text>
              </View>
              {player.minor ? <Tag label="-18" /> : null}
            </View>
          ) : null}
          <Text style={{ ...font('body', 500), fontSize: 14, lineHeight: 20, color: colors.ink }}>
            {body}
          </Text>
          {perk ? (
            <View
              style={{
                backgroundColor: colors.ratingSoft,
                borderWidth: border.thin,
                borderColor: colors.ink,
                borderRadius: radius.field,
                padding: 12,
              }}
            >
              <Text style={{ ...font('body', 800), fontSize: 14, color: colors.ink }}>
                À appliquer : {perk}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Raised>
  )
}
