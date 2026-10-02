import { Pressable, Text, View } from 'react-native'
import { border, colors, font, type Tone, toneStyles } from '../tokens'

export function Banner({
  message,
  tone = 'warn',
  action,
  onAction,
  onClose,
}: {
  message: string
  tone?: Tone
  action?: string
  onAction?: () => void
  onClose?: () => void
}) {
  const t = toneStyles[tone]
  return (
    <View
      role="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: t.soft,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ ...font('body', 800), fontSize: 16, color: colors.ink }}>{t.icon}</Text>
      <Text style={{ flex: 1, ...font('body', 600), fontSize: 14, color: colors.ink }}>
        {message}
      </Text>
      {action ? (
        <Pressable role="button" onPress={onAction}>
          <Text style={{ ...font('body', 800), fontSize: 13, color: colors.event }}>{action}</Text>
        </Pressable>
      ) : null}
      {onClose ? (
        <Pressable role="button" onPress={onClose} aria-label="Fermer" hitSlop={12}>
          <Text style={{ ...font('body', 800), color: colors.ink }}>×</Text>
        </Pressable>
      ) : null}
    </View>
  )
}
