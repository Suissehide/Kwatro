import type { ReactNode } from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, space } from '../tokens'

/**
 * Feuille du bas (mobile) : titre, action à droite (« Tout effacer »), contenu défilant, pied fixe.
 * Appui sur le fond : fermée.
 */
export function BottomSheet({
  visible,
  title,
  action,
  footer,
  onClose,
  children,
}: {
  visible: boolean
  title: string
  action?: ReactNode
  footer?: ReactNode
  onClose: () => void
  children: ReactNode
}) {
  // ponytail: pas de glissement au doigt pour fermer, brancher @gorhom/bottom-sheet si on en a besoin
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} aria-label="Fermer" />
        <View
          role="dialog"
          aria-label={title}
          style={{
            maxHeight: '82%',
            backgroundColor: colors.cream,
            borderTopWidth: border.base,
            borderColor: colors.ink,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: colors.ink }} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: space.screen,
              paddingTop: 6,
              paddingBottom: 12,
            }}
          >
            <Typography variant="h2">{title}</Typography>
            {action}
          </View>
          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingHorizontal: space.screen, paddingBottom: 16, gap: 18 }}
          >
            {children}
          </ScrollView>
          {footer ? (
            <View
              style={{
                paddingTop: 12,
                paddingHorizontal: space.screen,
                paddingBottom: 30,
                borderTopWidth: border.base,
                borderColor: colors.ink,
                backgroundColor: colors.white,
              }}
            >
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}
