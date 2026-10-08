import {
  Banner,
  colors,
  EmptyState,
  PhotoReviewCard,
  SkeletonCard,
  Typography,
} from '@lucko/design-system'
import { formatAgo, type PendingAvatar } from '@lucko/shared'
import { CircleCheck } from 'lucide-react-native'
import { useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { ActionDialog } from '@/components/admin/ActionDialog'
import { AdminScreen } from '@/components/admin/AdminScreen'
import { openAdminUser } from '@/lib/admin'
import { useAdminAvatarsQuery, useAdminModerationMutations } from '@/queries/useAdminModeration'

const rows = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  )

/** Photos de profil que l'analyse automatique n'a pas su trancher (LKO-107). */
export default function AdminAvatarsScreen() {
  const width = useWindowDimensions().width
  const columns = width >= 1100 ? 3 : width >= 600 ? 2 : 1
  const avatars = useAdminAvatarsQuery()
  const { approveAvatar, rejectAvatar } = useAdminModerationMutations()
  const [rejecting, setRejecting] = useState<PendingAvatar | null>(null)
  const [reviewed, setReviewed] = useState(0)
  const done = () => setReviewed((n) => n + 1)

  return (
    <AdminScreen
      section="avatars"
      note="Photos que l’analyse automatique n’a pas su trancher : invisibles des autres joueurs tant qu’elles ne sont pas approuvées."
    >
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
          icon={<CircleCheck size={28} color={colors.ink} strokeWidth={2.5} />}
          title="Rien à valider"
          text="Toutes les photos de profil ont été traitées."
        />
      ) : (
        <View style={{ gap: 16 }}>
          {rows(avatars.data, columns).map((row) => (
            <View key={row[0]?.id} style={{ flexDirection: 'row', gap: 16 }}>
              {Array.from({ length: columns }, (_, i) => {
                const user = row[i]
                return (
                  <View key={user?.id ?? `vide-${i}`} style={{ flex: 1 }}>
                    {user ? (
                      <PhotoReviewCard
                        uri={user.avatarUrl}
                        name={user.pseudo ?? 'Sans pseudo'}
                        age={formatAgo(user.submittedAt)}
                        badge="Photo envoyée"
                        busy={approveAvatar.isPending}
                        onOpen={() => openAdminUser(user.id)}
                        onApprove={() => approveAvatar.mutate(user.id, { onSuccess: done })}
                        onReject={() => setRejecting(user)}
                      />
                    ) : null}
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      )}
      {reviewed > 0 ? (
        <Typography variant="small" weight={600} style={{ color: colors.venue }}>
          {reviewed} photo{reviewed > 1 ? 's traitées' : ' traitée'} pendant cette session.
        </Typography>
      ) : null}
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
          done()
        }}
      />
    </AdminScreen>
  )
}
