import { ChevronRight, type LucideIcon } from 'lucide-react-native'
import { Children, type ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { Button } from '../atoms/Button'
import { Raised } from '../atoms/Raised'
import { Toggle } from '../atoms/Toggle'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, transition } from '../tokens'

export type SettingsRowData = {
  label: string
  description?: string
  /** Valeur courante ou compteur, avant le chevron. */
  value?: string
  /** Icône à la place du chevron (lien externe, e-mail). */
  icon?: LucideIcon
  /** Interrupteur : toute la ligne bascule la valeur, sans chevron. */
  toggle?: { value: boolean; onChange: (v: boolean) => void }
  /** Bouton ou contenu libre à droite (web). */
  aside?: ReactNode
  onPress?: () => void
  /** Ligne de suppression : fond rouge pâle, libellé rouge. */
  danger?: boolean
  /** Atténuée mais modifiable (notifications coupées sur le téléphone). */
  dimmed?: boolean
  /** Carte web : marges larges, libellé 800, état de l'interrupteur écrit. */
  wide?: boolean
}

/** Ligne de réglage : libellé et description, puis valeur, chevron, icône, interrupteur ou bouton. */
export function SettingsRow({
  label,
  description,
  value,
  icon: Icon,
  toggle,
  aside,
  onPress,
  danger,
  dimmed,
  wide,
}: SettingsRowData) {
  const { hovered, hoverProps } = useHover()
  const press = toggle ? () => toggle.onChange(!toggle.value) : onPress
  return (
    <Pressable
      onPress={press}
      disabled={!press}
      role={toggle ? 'switch' : onPress ? 'link' : undefined}
      aria-checked={toggle?.value}
      aria-label={toggle ? label : undefined}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: wide ? 16 : 12,
        minHeight: description ? 60 : 52,
        paddingVertical: wide ? (toggle || aside ? 16 : 14) : description ? 12 : 10,
        paddingHorizontal: wide ? 20 : 14,
        opacity: dimmed ? 0.5 : 1,
        backgroundColor: press && hovered ? colors.hover : danger ? colors.roomPale : 'transparent',
        ...transition(['background-color']),
      }}
    >
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text
          style={{
            ...font('body', wide ? 800 : 600),
            fontSize: 15,
            color: danger ? colors.room : colors.ink,
          }}
        >
          {label}
        </Text>
        {description ? <Typography variant="small">{description}</Typography> : null}
      </View>
      {value ? (
        <Text
          numberOfLines={1}
          style={{
            ...font('mono', 700),
            fontSize: wide ? 13 : 12,
            color: colors.muted,
            flexShrink: 1,
          }}
        >
          {value}
        </Text>
      ) : null}
      {toggle && wide ? (
        <Text
          style={{
            ...font('mono', 700),
            fontSize: 12,
            width: 72,
            textAlign: 'right',
            color: toggle.value ? colors.venue : colors.muted,
          }}
        >
          {toggle.value ? 'Activées' : 'Coupées'}
        </Text>
      ) : null}
      {toggle ? <Toggle label={label} value={toggle.value} onChange={toggle.onChange} /> : null}
      {aside}
      {Icon ? (
        <Icon size={18} color={colors.ink} strokeWidth={2.5} />
      ) : onPress && !aside ? (
        <ChevronRight size={18} color={wide ? colors.ink : colors.muted} strokeWidth={2.5} />
      ) : null}
    </Pressable>
  )
}

/** Carte blanche de lignes séparées ; `raised` pour l'ombre de la carte. */
export function SettingsCard({ raised, children }: { raised?: boolean; children: ReactNode }) {
  const card = (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      {Children.toArray(children).map((child, i) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: lignes fixes, jamais réordonnées
          key={i}
          style={i ? { borderTopWidth: border.thin, borderColor: colors.line } : null}
        >
          {child}
        </View>
      ))}
    </View>
  )
  return raised ? (
    <Raised offset={shadow.card} r={radius.card}>
      {card}
    </Raised>
  ) : (
    card
  )
}

/** Valeur en lecture seule, son libellé au-dessus (e-mail de connexion). */
export function SettingsField({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ paddingVertical: 14, paddingHorizontal: 20, gap: 2 }}>
      <Typography variant="label">{label}</Typography>
      <Text numberOfLines={1} style={{ ...font('body', 600), fontSize: 15, color: colors.ink }}>
        {value}
      </Text>
    </View>
  )
}

/** Joueur en tête des réglages : avatar, pseudo, une ligne de détail et une action à droite. */
export function SettingsIdentity({
  pseudo,
  avatarUri,
  detail,
  size = 48,
  aside,
}: {
  pseudo: string
  avatarUri?: string | null
  detail: string
  size?: number
  aside?: ReactNode
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: size > 48 ? 16 : 12,
        paddingVertical: size > 48 ? 18 : 14,
        paddingHorizontal: size > 48 ? 20 : 14,
      }}
    >
      <Avatar name={pseudo} uri={avatarUri} size={size} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Typography variant="title" numberOfLines={1}>
          {pseudo}
        </Typography>
        <Typography variant="small" numberOfLines={1}>
          {detail}
        </Typography>
      </View>
      {aside}
    </View>
  )
}

/** Alerte en tête d'un groupe : titre, explication et action (notifications coupées sur le téléphone). */
export function SettingsNotice({
  title,
  message,
  action,
  onAction,
}: {
  title: string
  message: string
  action: string
  onAction: () => void
}) {
  return (
    <View
      style={{
        gap: 10,
        padding: 14,
        backgroundColor: colors.ratingSoft,
        borderBottomWidth: border.thin,
        borderColor: colors.ink,
      }}
    >
      <Text style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>{title}</Text>
      <Typography variant="small" color={colors.ink}>
        {message}
      </Typography>
      <View style={{ alignSelf: 'flex-start' }}>
        <Button small kind="ink" label={action} onPress={onAction} />
      </View>
    </View>
  )
}

/** Groupe de réglages (téléphone) : libellé puis carte de lignes, `notice` en tête de carte. */
export function SettingsGroup({
  title,
  rows,
  notice,
}: {
  title: string
  rows: SettingsRowData[]
  notice?: ReactNode
}) {
  return (
    <View style={{ gap: 8, marginTop: 12 }}>
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
        {notice}
        {rows.map((row, i) => (
          <View
            key={row.label}
            style={i ? { borderTopWidth: border.thin, borderColor: colors.line } : null}
          >
            <SettingsRow {...row} />
          </View>
        ))}
      </View>
    </View>
  )
}
