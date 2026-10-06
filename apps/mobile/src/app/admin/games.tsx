import {
  Banner,
  Button,
  ChipGroup,
  ConfirmDialog,
  ReviewCard,
  SkeletonCard,
  Typography,
} from '@kwatro/design-system'
import type { AdminGame } from '@kwatro/shared'
import { useState } from 'react'
import { View } from 'react-native'
import { AdminScreen } from '@/components/admin/AdminScreen'
import { useAdminCatalogMutations, useAdminGamesQuery } from '@/queries/useAdminCatalog'

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? 's' : ''}`

/**
 * Catalogue des jeux : fusionner un doublon dans le bon jeu. Formats, profils (Kwote), rooms,
 * événements, lieux et joueurs passent au jeu cible, puis le doublon est supprimé.
 */
export default function AdminGamesScreen() {
  const games = useAdminGamesQuery()
  const { mergeGames } = useAdminCatalogMutations()
  const [duplicate, setDuplicate] = useState<AdminGame | null>(null)
  const [intoId, setIntoId] = useState<string | null>(null)
  const target = games.data?.find((g) => g.id === intoId)
  const close = () => {
    setDuplicate(null)
    setIntoId(null)
    mergeGames.reset()
  }

  return (
    <AdminScreen section="games">
      {games.isError ? (
        <Banner tone="err" message={games.error.message} />
      ) : !games.data ? (
        <SkeletonCard />
      ) : (
        <View style={{ gap: 12 }}>
          {games.data.map((game) => (
            <ReviewCard
              key={game.id}
              title={game.name}
              meta={`${game.slug} · ${game.formats.map((f) => f.name).join(', ') || 'sans format'}`}
              body={`${plural(game.rooms, 'room')} · ${plural(game.events, 'événement')} · ${plural(game.players, 'joueur')}`}
              actions={
                <Button
                  small
                  kind="ghost"
                  label="Fusionner dans…"
                  onPress={() => setDuplicate(game)}
                />
              }
            />
          ))}
        </View>
      )}
      <ConfirmDialog
        visible={duplicate !== null}
        title={`Fusionner ${duplicate?.name ?? ''} ?`}
        message={
          target
            ? `${duplicate?.name} est fondu dans ${target.name} puis supprimé. Un joueur présent dans les deux garde le profil le plus joué en classé. Irréversible.`
            : 'Choisis le jeu à garder.'
        }
        confirmLabel="Fusionner"
        cancelLabel="Annuler"
        confirmDisabled={!target || mergeGames.isPending}
        onCancel={close}
        onConfirm={() => {
          if (duplicate && target)
            mergeGames.mutate({ id: duplicate.id, intoId: target.id }, { onSuccess: close })
        }}
      >
        <Typography variant="label">Jeu à garder</Typography>
        <ChipGroup
          items={(games.data ?? [])
            .filter((g) => g.id !== duplicate?.id)
            .map((g) => ({ key: g.id, label: g.name }))}
          value={intoId}
          onChange={setIntoId}
        />
        {mergeGames.isError ? <Banner tone="err" message={mergeGames.error.message} /> : null}
      </ConfirmDialog>
    </AdminScreen>
  )
}
