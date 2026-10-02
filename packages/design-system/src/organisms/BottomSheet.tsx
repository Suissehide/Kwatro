import type { ReactNode } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

/** Feuille du bas (mobile). Pour le glissement au doigt, brancher @gorhom/bottom-sheet avec ce style. */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: colors.scrim }}
        onPress={onClose}
        aria-label="Fermer"
      />
      <View
        role="dialog"
        aria-label={title}
        style={{
          backgroundColor: colors.cream,
          borderWidth: border.base,
          borderBottomWidth: 0,
          borderColor: colors.ink,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 10,
          paddingHorizontal: 16,
          paddingBottom: 28,
          gap: 10,
        }}
      >
        <View
          style={{
            width: 44,
            height: 5,
            borderRadius: 99,
            backgroundColor: colors.ink,
            alignSelf: 'center',
          }}
        />
        <Text style={{ ...font('body', 800), fontSize: 16, color: colors.ink }}>{title}</Text>
        {children}
      </View>
    </Modal>
  )
}
