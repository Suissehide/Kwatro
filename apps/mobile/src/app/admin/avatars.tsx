import {
  Avatar,
  Banner,
  Button,
  EmptyState,
  ReviewCard,
  SkeletonCard,
  Typography,
} from '@kwatro/design-system'
import type { PendingAvatar } from '@kwatro/shared'
import { useState } from 'react'
import { View } from 'react-native'
import { ActionDialog } from '@/components/admin/ActionDialog'
import { AdminScreen } from '@/components/admin/AdminScreen'
import { openAdminUser } from '@/lib/admin'
import { useAdminAvatarsQuery, useAdminModerationMutations } from '@/queries/useAdminModeration'

/** Photos de profil à valider avant qu'elles soient visibles des autres joueurs. */
export default function AdminAvatarsScreen() {
  const avatars = useAdminAvatarsQuery()
  const { approveAvatar, rejectAvatar } = useAdminModerationMutations()
  const [rejecting, setRejecting] = useState<PendingAvatar | null>(null)

  return (
    <AdminScreen section="avatars">
      {approveAvatar.isError ? <Banner tone="err" message={approveAvatar.error.message} /> : null}
      {avatars.isError ? (
        <Banner
          tone="err"
          message="Impossible de charger les photos."
          action="Réessayer"
          onAction={() => void avatars.refetch()}
        />
      ) : !avatars.data ? (
        <SkeletonCard />
      ) : avatars.data.length === 0 ? (
        <EmptyState
          dashed
          icon={<Typography variant="h2">✓</Typography>}
          title="Rien à valider"
          text="Toutes les photos de profil ont été traitées."
        />
      ) : (
        <View style={{ gap: 12 }}>
          {avatars.data.map((user) => (
            <ReviewCard
              key={user.id}
              left={<Avatar name={user.pseudo ?? '?'} uri={user.avatarUrl} size={96} />}
              title={user.pseudo ?? 'Sans pseudo'}
              meta="Visible des autres joueurs une fois approuvée"
              onPress={() => openAdminUser(user.id)}
              actions={
                <>
                  <Button
                    small
                    kind="venue"
                    label="Approuver"
                    disabled={approveAvatar.isPending}
                    onPress={() => approveAvatar.mutate(user.id)}
                  />
                  <Button small kind="room" label="Refuser" onPress={() => setRejecting(user)} />
                </>
              }
            />
          ))}
        </View>
      )}
      <ActionDialog
        key={rejecting?.id ?? 'closed'}
        visible={rejecting !== null}
        title="Refuser la photo ?"
        message="Elle est retirée du profil : le joueur garde son initiale."
        confirmLabel="Refuser"
        onCancel={() => setRejecting(null)}
        onConfirm={async ({ text }) => {
          if (!rejecting) return
          await rejectAvatar.mutateAsync({ id: rejecting.id, reason: text })
          setRejecting(null)
        }}
      />
    </AdminScreen>
  )
}
