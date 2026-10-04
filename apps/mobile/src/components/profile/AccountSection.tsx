import { Banner, Button, ConfirmDialog, Panel, Section, Typography } from '@kwatro/design-system'
import { router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { useMeMutations } from '@/queries/useMe'

/** Compte : suppression du compte depuis l'app (exigence Apple, KWT-18). */
export function AccountSection({ wide }: { wide: boolean }) {
  const [confirming, setConfirming] = useState(false)
  const { deleteAccount } = useMeMutations()

  const confirmDelete = () => {
    setConfirming(false)
    deleteAccount.mutate(undefined, { onSuccess: () => router.replace('/auth') })
  }

  return (
    <Section title="Compte">
      <Panel compact={!wide}>
        <View style={{ gap: 4 }}>
          <Typography variant="title">Supprimer mon compte</Typography>
          <Typography variant="small">
            Ton profil, tes niveaux et tes inscriptions à venir sont supprimés ; tes rooms à venir
            sont annulées. C’est définitif.
          </Typography>
        </View>
        {deleteAccount.isError ? (
          <Banner tone="err" message="La suppression a échoué. Réessaie dans un instant." />
        ) : null}
        <View style={wide ? { alignSelf: 'flex-start' } : null}>
          <Button label="Supprimer mon compte" onPress={() => setConfirming(true)} />
        </View>
      </Panel>
      <ConfirmDialog
        visible={confirming}
        title={'Supprimer ton compte ?'}
        message="Toutes tes données seront effacées. Tu ne pourras pas revenir en arrière."
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </Section>
  )
}
