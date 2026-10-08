import { Check } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { border, colors, font, shadow } from '../tokens'

/** Fin d'un parcours (« Room créée ») : badge vert incliné, titre, texte et actions. */
export function SuccessState({
  title,
  text,
  actions,
  compact,
}: {
  title: string
  text: string
  actions?: ReactNode
  compact?: boolean
}) {
  const size = compact ? 72 : 84
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 14 : 16,
        paddingVertical: 24,
      }}
    >
      <Raised
        offset={shadow.card}
        r={compact ? 18 : 20}
        style={{ transform: [{ rotate: '-4deg' }] }}
      >
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.venue,
            borderWidth: border.base,
            borderColor: colors.ink,
            borderRadius: compact ? 18 : 20,
          }}
        >
          <Check size={compact ? 34 : 40} color={colors.white} strokeWidth={3} />
        </View>
      </Raised>
      <Text
        role="heading"
        style={{
          ...font('display'),
          fontSize: compact ? 26 : 34,
          lineHeight: compact ? 27 : 35,
          textTransform: 'uppercase',
          color: colors.ink,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          ...font('body', 400),
          fontSize: compact ? 14 : 16,
          lineHeight: compact ? 20 : 23,
          color: colors.muted,
          textAlign: 'center',
          maxWidth: 420,
        }}
      >
        {text}
      </Text>
      {actions ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {actions}
        </View>
      ) : null}
    </View>
  )
}
