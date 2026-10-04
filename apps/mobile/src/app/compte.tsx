import {
  Banner,
  Button,
  ConfirmDialog,
  MobileScreen,
  ScreenHeader,
  Section,
  Typography,
} from '@kwatro/design-system'
import { router } from 'expo-router'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '@/lib/api'
import { useMe } from '@/lib/useMe'

/** Mon compte : suppression du compte depuis l'app (exigence Apple, KWT-18). */
export default function AccountScreen() {
  const insets = useSafeAreaInsets()
  const me = useMe({ required: true })
  const [confirming, setConfirming] = useState(false)
  const [failed, setFailed] = useState(false)

  async function deleteAccount() {
    setConfirming(false)
    const { response } = await api.DELETE('/me').catch(() => ({ response: null }))
    if (response?.ok) router.replace('/auth')
    else setFailed(true)
  }

  return (
    <MobileScreen
      insets={insets}
      header={
        <ScreenHeader
          title="Mon compte"
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
        />
      }
    >
      {me ? (
        <Typography variant="small">
          Connecté en tant que {me.pseudo} ({me.email})
        </Typography>
      ) : null}
      <Section title="Supprimer mon compte">
        <Typography variant="small">
          Ton profil, tes niveaux et tes inscriptions à venir sont supprimés, et tes rooms à venir
          sont annulées. C'est définitif.
        </Typography>
        {failed ? (
          <Banner tone="err" message="La suppression a échoué. Réessaie dans un instant." />
        ) : null}
        <Button label="Supprimer mon compte" onPress={() => setConfirming(true)} />
      </Section>
      <ConfirmDialog
        visible={confirming}
        title="Supprimer ton compte ?"
        message="Toutes tes données seront effacées. Tu ne pourras pas revenir en arrière."
        confirmLabel="Supprimer"
        onConfirm={deleteAccount}
        onCancel={() => setConfirming(false)}
      />
    </MobileScreen>
  )
}
