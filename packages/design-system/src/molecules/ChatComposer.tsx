import { ArrowUp } from 'lucide-react-native'
import { type ReactNode, useState } from 'react'
import { Platform, TextInput, type TextStyle, View } from 'react-native'
import { Button } from '../atoms/Button'
import { IconButton } from '../atoms/IconButton'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius } from '../tokens'
import { focusRing, noOutline } from './TextField'

/**
 * Zone de saisie du chat : texte sur plusieurs lignes et bouton d'envoi. Entrée envoie sur le web
 * (Maj + Entrée pour aller à la ligne). `status` : « Léa écrit… » ; `accessory` : option au-dessus (annonce).
 * `compact` (téléphone) : champ de 44 px et bouton d'envoi à icône seule.
 */
export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled,
  maxLength,
  placeholder = 'Écrire un message',
  status,
  accessory,
  compact,
}: {
  value: string
  onChange: (text: string) => void
  onSend: () => void
  disabled?: boolean
  maxLength?: number
  placeholder?: string
  status?: string | null
  accessory?: ReactNode
  compact?: boolean
}) {
  const [focus, setFocus] = useState(false)
  const empty = !value.trim()
  const off = disabled || empty
  return (
    <View style={{ gap: compact ? 6 : 8 }}>
      {status ? (
        <Typography variant="small" style={{ fontStyle: 'italic', fontSize: compact ? 12 : 13 }}>
          {status}
        </Typography>
      ) : null}
      {accessory}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: compact ? 8 : 10 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          aria-label={placeholder}
          multiline
          // Web : une ligne au départ (le textarea en affiche deux par défaut)
          numberOfLines={Platform.OS === 'web' ? 1 : undefined}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyPress={(e) => {
            const key = e.nativeEvent as { key: string; shiftKey?: boolean }
            if (Platform.OS === 'web' && key.key === 'Enter' && !key.shiftKey) {
              e.preventDefault()
              if (!empty) onSend()
            }
          }}
          style={[
            {
              flex: 1,
              minHeight: compact ? 44 : 52, // hauteur du Button
              maxHeight: compact ? 110 : 120,
              borderWidth: border.base,
              borderColor: colors.ink,
              borderRadius: radius.field,
              backgroundColor: colors.white,
              paddingHorizontal: 12,
              paddingVertical: compact ? 10 : 14,
              ...font('body', 400),
              fontSize: 15,
              lineHeight: 20,
              color: colors.ink,
            },
            noOutline,
            focus ? (focusRing as TextStyle) : null,
          ]}
        />
        {compact ? (
          <IconButton
            size={44}
            label="Envoyer"
            bg={colors.room}
            disabled={off}
            onPress={onSend}
            icon={
              <ArrowUp
                size={20}
                color={off ? colors.disabledText : colors.white}
                strokeWidth={2.5}
              />
            }
          />
        ) : (
          <Button kind="room" label="Envoyer" disabled={off} onPress={onSend} />
        )}
      </View>
      {Platform.OS === 'web' && !compact ? (
        <Typography variant="label" style={{ ...font('mono', 400), textTransform: 'none' }}>
          Entrée pour envoyer · Maj + Entrée pour aller à la ligne
        </Typography>
      ) : null}
    </View>
  )
}
