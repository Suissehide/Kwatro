import {
  Banner,
  Button,
  ConfirmDialog,
  EmptyState,
  ListRow,
  PageTitle,
  ScreenHeader,
  SkeletonCard,
  Typography,
} from '@kwatro/design-system'
import type { BlockedPlayer } from '@kwatro/shared'
import { router } from 'expo-router'
import { useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { PlayerScreen } from '@/components/PlayerScreen'
import { useBlocksQuery, useUnblockMutation } from '@/queries/useBlocks'
import { useMeQuery } from '@/queries/useMe'

const WIDE = 900

const backToSettings = () => (router.canGoBack() ? router.back() : router.replace('/settings'))

/** Réglages → Joueurs bloqués (KWT-19) : liste et déblocage. */
export default function BlockedScreen() {
  const wide = useWindowDimensions().width >= WIDE
  useMeQuery({ required: true })
  const blocks = useBlocksQuery()
  const unblock = useUnblockMutation()
  const [confirm, setConfirm] = useState<Pick<BlockedPlayer, 'id' | 'pseudo'> | null>(null)

  const content = !blocks.data ? (
    blocks.isError ? (
      <Banner
        tone="err"
        message="Impossible de charger les joueurs bloqués."
        action="Réessayer"
        onAction={() => void blocks.refetch()}
      />
    ) : (
      <SkeletonCard />
    )
  ) : blocks.data.length === 0 ? (
    <EmptyState
      dashed
      icon={<Typography variant="h2">◎</Typography>}
      title="Personne de bloqué"
      text="Un joueur bloqué ne voit plus tes rooms et tu ne vois plus les siennes."
    />
  ) : (
    <View style={{ gap: 12 }}>
      {unblock.isError ? (
        <Banner tone="err" message="Le déblocage a échoué. Réessaie dans un instant." />
      ) : null}
      <View>
        {blocks.data.map((player, i, all) => (
          <ListRow
            key={player.id}
            title={player.pseudo ?? 'Compte supprimé'}
            last={i === all.length - 1}
            right={
              <Button small kind="ghost" label="Débloquer" onPress={() => setConfirm(player)} />
            }
          />
        ))}
      </View>
    </View>
  )

  return (
    <PlayerScreen
      tab="profil"
      wide={wide}
      pushed
      header={<ScreenHeader title="Joueurs bloqués" onBack={backToSettings} />}
    >
      {wide ? (
        <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', gap: 20 }}>
          <PageTitle title="Joueurs bloqués" />
          {content}
        </View>
      ) : (
        content
      )}
      <ConfirmDialog
        visible={confirm !== null}
        title={`Débloquer ${confirm?.pseudo ?? 'ce joueur'} ?`}
        message="Tu reverras ses rooms, et il ou elle reverra les tiennes."
        confirmLabel="Débloquer"
        cancelLabel="Annuler"
        onConfirm={() => {
          if (confirm) unblock.mutate(confirm.id)
          setConfirm(null)
        }}
        onCancel={() => setConfirm(null)}
      />
    </PlayerScreen>
  )
}
