import { Modal, Text, View } from 'react-native'
import { Button } from '../atoms/Button'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { border, colors, font, shadow } from '../tokens'

/**
 * Dialogue de confirmation : titre en question, conséquence, action destructive à droite.
 * `sheet` (téléphone) : feuille qui monte du bas, action pleine largeur au-dessus d'« Annuler ».
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Garder',
  destructive = true,
  sheet,
  onConfirm,
  onCancel,
}: {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  sheet?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const confirmKind = destructive ? 'room' : 'ink'
  if (sheet) {
    return (
      <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
        <View style={{ flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' }}>
          <View
            role="alertdialog"
            aria-modal
            aria-label={title}
            style={{
              backgroundColor: colors.cream,
              borderTopWidth: border.base,
              borderColor: colors.ink,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 24,
              paddingHorizontal: 20,
              paddingBottom: 36,
              gap: 14,
            }}
          >
            <Typography variant="h2">{title}</Typography>
            <Typography color={colors.muted}>{message}</Typography>
            <View style={{ gap: 14, marginTop: 6 }}>
              <Button kind={confirmKind} label={confirmLabel} onPress={onConfirm} />
              <Button kind="ghost" label={cancelLabel} onPress={onCancel} />
            </View>
          </View>
        </View>
      </Modal>
    )
  }
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.scrim,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Raised offset={shadow.lg} r={16}>
          <View
            role="alertdialog"
            aria-modal
            aria-label={title}
            style={{
              backgroundColor: colors.white,
              borderWidth: border.base,
              borderColor: colors.ink,
              borderRadius: 16,
              padding: 18,
              gap: 12,
              maxWidth: 420,
            }}
          >
            <Text
              style={{
                ...font('display'),
                fontSize: 22,
                textTransform: 'uppercase',
                color: colors.ink,
              }}
            >
              {title}
            </Text>
            <Text
              style={{ ...font('body', 400), fontSize: 14, lineHeight: 20, color: colors.muted }}
            >
              {message}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button small kind="ghost" label={cancelLabel} onPress={onCancel} />
              </View>
              <View style={{ flex: 1 }}>
                <Button small kind={confirmKind} label={confirmLabel} onPress={onConfirm} />
              </View>
            </View>
          </View>
        </Raised>
      </View>
    </Modal>
  )
}
