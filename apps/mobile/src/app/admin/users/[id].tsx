import {
  Avatar,
  Banner,
  Button,
  colors,
  EmptyState,
  ListCard,
  ListRow,
  Panel,
  Section,
  SkeletonCard,
  StatusPill,
  Tag,
  Typography,
} from '@kwatro/design-system'
import { ADMIN_ACTION_LABELS, REPORT_REASON_LABELS, REPORT_RESOLUTION_LABELS } from '@kwatro/shared'
import { useLocalSearchParams } from 'expo-router'
import { Flag } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { ActionDialog } from '@/components/admin/ActionDialog'
import { AdminScreen } from '@/components/admin/AdminScreen'
import { dateTime, suspensionLabel } from '@/lib/admin'
import { shortDay } from '@/lib/explore'
import { useAdminModerationMutations, useAdminUserQuery } from '@/queries/useAdminModeration'

/** Fiche joueur du back-office : identité, suspension, signalements reçus et actions des admins. */
export default function AdminUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const user = useAdminUserQuery(id)
  const { suspend, unsuspend } = useAdminModerationMutations()
  const [dialog, setDialog] = useState<'suspend' | 'unsuspend' | null>(null)
  const u = user.data

  return (
    <AdminScreen section="users" title={u?.pseudo ?? 'Joueur'} back>
      {user.isError ? (
        <Banner tone="err" message={user.error.message} />
      ) : !u ? (
        <SkeletonCard />
      ) : (
        <>
          <Panel compact>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <Avatar
                name={u.pseudo ?? '?'}
                uri={u.avatarStatus === 'APPROVED' ? u.avatarUrl : null}
                size={56}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <Typography variant="title">{u.pseudo ?? 'Sans pseudo'}</Typography>
                  {u.minor ? <Tag label="-18" variant="tonight" /> : null}
                  {u.deleted ? <StatusPill tone="neutral" label="Compte supprimé" /> : null}
                </View>
                <Typography variant="small">
                  {u.email} · inscrit le {shortDay(u.createdAt)}
                </Typography>
              </View>
              {u.role === 'ADMIN' || u.deleted ? null : u.suspension ? (
                <Button small kind="ghost" label="Lever" onPress={() => setDialog('unsuspend')} />
              ) : (
                <Button small kind="room" label="Suspendre" onPress={() => setDialog('suspend')} />
              )}
            </View>
            {u.suspension ? (
              <Banner
                tone="err"
                message={`${suspensionLabel(u.suspension)} : ${u.suspension.reason}`}
              />
            ) : null}
          </Panel>

          <Section title={`Signalements reçus (${u.reports.length})`}>
            {u.reports.length === 0 ? (
              <EmptyState
                dashed
                icon={<Flag size={28} color={colors.ink} strokeWidth={2.5} />}
                title="Aucun signalement"
                text="Personne n’a signalé ce joueur."
              />
            ) : (
              <ListCard>
                {u.reports.map((r, i, all) => (
                  <ListRow
                    key={r.id}
                    inset={14}
                    title={REPORT_REASON_LABELS[r.reason]}
                    subtitle={`Par ${r.reporter.pseudo ?? 'compte supprimé'} · ${dateTime(r.createdAt)}`}
                    note={r.details || undefined}
                    right={
                      r.resolution ? (
                        <StatusPill tone="neutral" label={REPORT_RESOLUTION_LABELS[r.resolution]} />
                      ) : (
                        <StatusPill tone="warn" label="Ouvert" />
                      )
                    }
                    last={i === all.length - 1}
                  />
                ))}
              </ListCard>
            )}
          </Section>

          <Section title="Historique de la modération">
            {u.actions.length === 0 ? (
              <Typography variant="small">Aucune action d’un admin sur ce joueur.</Typography>
            ) : (
              <ListCard>
                {u.actions.map((a, i, all) => (
                  <ListRow
                    key={a.id}
                    inset={14}
                    title={ADMIN_ACTION_LABELS[a.action]}
                    subtitle={`${a.admin.pseudo ?? 'Admin'} · ${dateTime(a.createdAt)}`}
                    note={a.reason || undefined}
                    last={i === all.length - 1}
                  />
                ))}
              </ListCard>
            )}
          </Section>
        </>
      )}

      <ActionDialog
        key={`suspend-${dialog === 'suspend'}`}
        visible={dialog === 'suspend'}
        title={`Suspendre ${u?.pseudo ?? 'ce joueur'} ?`}
        message="Déconnecté partout, il ne peut plus se connecter. Ses rooms à venir sont annulées."
        confirmLabel="Suspendre"
        duration
        onCancel={() => setDialog(null)}
        onConfirm={async ({ text, days }) => {
          await suspend.mutateAsync({ id, reason: text, days })
          setDialog(null)
        }}
      />
      <ActionDialog
        key={`unsuspend-${dialog === 'unsuspend'}`}
        visible={dialog === 'unsuspend'}
        title="Lever la suspension ?"
        message="Le joueur pourra se reconnecter tout de suite."
        confirmLabel="Lever"
        destructive={false}
        onCancel={() => setDialog(null)}
        onConfirm={async ({ text }) => {
          await unsuspend.mutateAsync({ id, reason: text })
          setDialog(null)
        }}
      />
    </AdminScreen>
  )
}
