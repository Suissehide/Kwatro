import type { ReactNode } from 'react'
import { Modal, Text, View } from 'react-native'
import { Button } from '../atoms/Button'
import { Raised } from '../atoms/Raised'
import { border, colors, font, shadow } from '../tokens'

/**
 * Dialogue de confirmation : titre en question, conséquence, action destructive à droite.
 * `children` : champs à remplir avant de confirmer (motif d'une sanction), `confirmDisabled` tant qu'ils manquent.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Garder',
  destructive = true,
  confirmDisabled,
  onConfirm,
  onCancel,
  children,
}: {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}) {
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
        {/* Avec des champs : largeur fixe, pour qu'elle ne suive pas la saisie */}
        <Raised
          offset={shadow.lg}
          r={16}
          style={children ? { width: '100%', maxWidth: 420 } : undefined}
        >
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
            {children}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button small kind="ghost" label={cancelLabel} onPress={onCancel} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  small
                  kind={destructive ? 'room' : 'ink'}
                  label={confirmLabel}
                  disabled={confirmDisabled}
                  onPress={onConfirm}
                />
              </View>
            </View>
          </View>
        </Raised>
      </View>
    </Modal>
  )
}
