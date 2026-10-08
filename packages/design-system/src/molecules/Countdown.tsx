import { Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

const clock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/**
 * Compte à rebours sans minuterie interne : l'écran fournit `seconds`. Sous 60 s, le chiffre passe
 * en rouge. Annonce aux lecteurs d'écran une fois par minute seulement.
 */
export function Countdown({
  seconds,
  total,
  label,
  variant,
  tone = 'light',
}: {
  seconds: number
  /** Durée complète, pour la largeur de la barre (`bar`). */
  total?: number
  label?: string
  variant: 'bar' | 'clock' | 'tv'
  /** Fond sous le composant : `dark` pour l'écran QR ou TV. */
  tone?: 'light' | 'dark'
}) {
  const s = Math.max(0, Math.round(seconds))
  const urgent = s < 60
  const minutes = Math.ceil(s / 60)
  const live = (
    <Text
      aria-live="polite"
      style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}
    >
      {urgent ? 'Moins d’une minute' : `${minutes} minutes restantes`}
    </Text>
  )

  if (variant === 'bar') {
    const ratio = total ? Math.min(1, s / total) : 0
    const fg = tone === 'dark' ? colors.white : colors.ink
    return (
      <View style={{ gap: 6 }}>
        <View
          aria-hidden
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          {label ? (
            <Text
              style={{
                ...font('mono', 700),
                fontSize: 11,
                textTransform: 'uppercase',
                color: tone === 'dark' ? colors.creamMuted : colors.muted,
              }}
            >
              {label}
            </Text>
          ) : (
            <View />
          )}
          <Text style={{ ...font('mono', 700), fontSize: 20, color: urgent ? colors.room : fg }}>
            {s} s
          </Text>
        </View>
        <View
          style={{
            height: 12,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: 99,
            backgroundColor: colors.white,
            overflow: 'hidden',
          }}
        >
          <View
            style={{ width: `${ratio * 100}%`, height: '100%', backgroundColor: colors.rating }}
          />
        </View>
        {live}
      </View>
    )
  }

  const tv = variant === 'tv'
  const base = tv || tone === 'dark' ? colors.rating : colors.ink
  return (
    <View style={{ gap: 4 }}>
      {label ? (
        <Text
          aria-hidden
          style={{
            ...font('mono', 700),
            fontSize: 11,
            textTransform: 'uppercase',
            color: tone === 'dark' ? colors.creamMuted : colors.muted,
          }}
        >
          {label}
        </Text>
      ) : null}
      <Text
        aria-hidden
        style={{
          ...font('mono', 700),
          fontSize: tv ? 148 : 56,
          lineHeight: tv ? 130 : 56,
          color: urgent ? colors.room : base,
        }}
      >
        {clock(s)}
      </Text>
      {live}
    </View>
  )
}
