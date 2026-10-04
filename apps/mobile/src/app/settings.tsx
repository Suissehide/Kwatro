import {
  Banner,
  Button,
  ConfirmDialog,
  colors,
  font,
  PageTitle,
  ScreenHeader,
  SettingsGroup,
  SkeletonCard,
  TextLink,
  Typography,
} from '@kwatro/design-system'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { PlayerScreen } from '@/components/PlayerScreen'
import { openSite } from '@/lib/navigation'
import { signOut, useMeMutations, useMeQuery } from '@/queries/useMe'

const WIDE = 900

const backToProfile = () => (router.canGoBack() ? router.back() : router.replace('/profile'))

// ponytail: mot de passe, fournisseur lié et préférences (notifications, langue) attendent leurs écrans
const KWATRO_ROWS = [
  { label: 'Aide', onPress: () => openSite('/aide') },
  { label: "Conditions d'utilisation", onPress: () => openSite('/cgu') },
  { label: 'Politique de confidentialité', onPress: () => openSite('/confidentialite') },
]

/** Réglages du compte : e-mail, liens Kwatro, déconnexion et suppression du compte (KWT-18). */
export default function SettingsScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const me = useMeQuery({ required: true })
  const { deleteAccount } = useMeMutations()
  const [confirm, setConfirm] = useState<'signOut' | 'delete' | null>(null)

  const confirmDelete = () => {
    setConfirm(null)
    deleteAccount.mutate(undefined, { onSuccess: () => router.replace('/auth') })
  }

  const content = me ? (
    <View style={{ gap: 12 }}>
      <SettingsGroup title="Compte" rows={[{ label: 'E-mail', value: me.email }]} />
      <SettingsGroup title="Kwatro" rows={KWATRO_ROWS} />
      <View style={{ marginTop: 20 }}>
        {/* Desktop : pas de confirmation, comme dans le menu du compte */}
        <Button
          kind="danger"
          label="Se déconnecter"
          onPress={() => (wide ? void signOut() : setConfirm('signOut'))}
        />
      </View>
      {deleteAccount.isError ? (
        <Banner tone="err" message="La suppression a échoué. Réessaie dans un instant." />
      ) : null}
      <View style={{ alignItems: 'center', gap: 6, marginTop: 8 }}>
        <TextLink muted label="Supprimer mon compte" onPress={() => setConfirm('delete')} />
        <Typography style={{ ...font('mono', 400), fontSize: 12, color: colors.muted }}>
          Kwatro {Constants.expoConfig?.version}
        </Typography>
      </View>
    </View>
  ) : (
    <SkeletonCard />
  )

  return (
    <PlayerScreen
      tab="profil"
      wide={wide}
      pushed
      header={<ScreenHeader title="Réglages" onBack={backToProfile} />}
    >
      {wide ? (
        <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', gap: 20 }}>
          <PageTitle title="Réglages" />
          {content}
        </View>
      ) : (
        content
      )}
      <ConfirmDialog
        visible={confirm === 'signOut'}
        title="Se déconnecter de Kwatro ?"
        message="Tu pourras te reconnecter quand tu veux."
        confirmLabel="Se déconnecter"
        cancelLabel="Annuler"
        onConfirm={() => {
          setConfirm(null)
          void signOut()
        }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'delete'}
        title="Supprimer ton compte ?"
        message="Toutes tes données seront effacées. Tu ne pourras pas revenir en arrière."
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </PlayerScreen>
  )
}
