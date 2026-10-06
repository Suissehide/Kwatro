import type { ReactNode } from 'react'
import { Platform, TextInput, View } from 'react-native'
import { Button } from '../atoms/Button'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius } from '../tokens'

/**
 * Zone de saisie du chat : texte sur plusieurs lignes et bouton d'envoi. Entrée envoie sur le web
 * (Maj + Entrée pour aller à la ligne). `status` : « Léa écrit… » ; `accessory` : option au-dessus (annonce).
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
}: {
  value: string
  onChange: (text: string) => void
  onSend: () => void
  disabled?: boolean
  maxLength?: number
  placeholder?: string
  status?: string | null
  accessory?: ReactNode
}) {
  const empty = !value.trim()
  return (
    <View style={{ gap: 8 }}>
      {status ? (
        <Typography variant="small" style={{ fontStyle: 'italic' }}>
          {status}
        </Typography>
      ) : null}
      {accessory}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          aria-label={placeholder}
          multiline
          maxLength={maxLength}
          editable={!disabled}
          onKeyPress={(e) => {
            const key = e.nativeEvent as { key: string; shiftKey?: boolean }
            if (Platform.OS === 'web' && key.key === 'Enter' && !key.shiftKey) {
              e.preventDefault()
              if (!empty) onSend()
            }
          }}
          style={{
            flex: 1,
            minHeight: 44,
            maxHeight: 120,
            borderWidth: border.base,
            borderColor: colors.ink,
            borderRadius: radius.field,
            backgroundColor: colors.white,
            paddingHorizontal: 12,
            paddingVertical: 10,
            ...font('body', 400),
            fontSize: 15,
            color: colors.ink,
          }}
        />
        <Button small kind="room" label="Envoyer" disabled={disabled || empty} onPress={onSend} />
      </View>
    </View>
  )
}
