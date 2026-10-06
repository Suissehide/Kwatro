import {
  Avatar,
  Banner,
  Button,
  colors,
  DetailCard,
  ReasonForm,
  SkeletonCard,
  StatusPill,
  TimelineItem,
  Typography,
} from '@lucko/design-system'
import { ADMIN_ACTION_LABELS, REPORT_REASON_LABELS, REPORT_RESOLUTION_LABELS } from '@lucko/shared'
import { useState } from 'react'
import { View } from 'react-native'
import {
  ACTION_COLOR,
  dateTime,
  ROLE_LABELS,
  SUSPENSION_DURATIONS,
  suspensionDays,
  suspensionLabel,
} from '@/lib/admin'
import { useAdminModerationMutations, useAdminUserQuery } from '@/queries/useAdminModeration'
import { UserStatus } from './UserStatus'

/** Fiche joueur en panneau latéral : identité, suspension, signalements reçus, historique, actions. */
export function UserPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const user = useAdminUserQuery(id)
  const { suspend, unsuspend } = useAdminModerationMutations()
  const [acting, setActing] = useState(false)
  const u = user.data

  if (user.isError) return <Banner tone="err" message={user.error.message} />
  if (!u) return <SkeletonCard />
  const pseudo = u.pseudo ?? 'Sans pseudo'
  const mutation = u.suspension ? unsuspend : suspend

  return (
    <DetailCard
      onClose={onClose}
      sections={[
        {
          key: 'who',
          children: (
            <View style={{ alignItems: 'center', gap: 6, paddingTop: 12 }}>
              <Avatar
                name={pseudo}
                uri={u.avatarStatus === 'APPROVED' ? u.avatarUrl : null}
                size={72}
              />
              <Typography variant="h2">{pseudo}</Typography>
              <Typography variant="small">
                {u.email} · {ROLE_LABELS[u.role]}
              </Typography>
              <UserStatus user={u} />
              {u.deleted ? <StatusPill tone="neutral" label="Compte supprimé" /> : null}
            </View>
          ),
        },
        u.suspension && {
          key: 'suspension',
          children: (
            <Banner
              tone="err"
              message={`${suspensionLabel(u.suspension)} : ${u.suspension.reason}`}
            />
          ),
        },
        {
          key: 'reports',
          label: `Signalements reçus · ${u.reports.length}`,
          children: u.reports.length ? (
            u.reports.map((r) => (
              <View key={r.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="small" weight={800} style={{ color: colors.ink }}>
                    {REPORT_REASON_LABELS[r.reason]}
                  </Typography>
                  <Typography variant="small" style={{ fontSize: 12 }}>
                    par {r.reporter.pseudo ?? 'compte supprimé'} · {dateTime(r.createdAt)}
                  </Typography>
                </View>
                {r.resolution ? (
                  <StatusPill tone="neutral" label={REPORT_RESOLUTION_LABELS[r.resolution]} />
                ) : (
                  <StatusPill tone="warn" label="Ouvert" />
                )}
              </View>
            ))
          ) : (
            <Typography variant="small">Personne n’a signalé ce joueur.</Typography>
          ),
        },
        {
          key: 'history',
          label: 'Historique de la modération',
          children: u.actions.length ? (
            u.actions.map((a) => (
              <TimelineItem
                key={a.id}
                color={
                  ACTION_COLOR[a.action] === colors.white ? colors.line : ACTION_COLOR[a.action]
                }
                title={ADMIN_ACTION_LABELS[a.action]}
                meta={`${a.admin.pseudo ?? 'Admin'} · ${dateTime(a.createdAt)}`}
                note={a.reason || undefined}
              />
            ))
          ) : (
            <Typography variant="small">Aucune action d’un admin sur ce joueur.</Typography>
          ),
        },
        !u.deleted && {
          key: 'actions',
          children:
            u.role === 'ADMIN' ? (
              <Typography variant="small">
                Les comptes admin ne peuvent pas être suspendus ici.
              </Typography>
            ) : acting ? (
              <ReasonForm
                label={u.suspension ? 'Motif de la levée' : 'Motif (envoyé au joueur)'}
                durations={u.suspension ? undefined : SUSPENSION_DURATIONS}
                initialDuration="7"
                consequence={
                  u.suspension
                    ? 'Il pourra se reconnecter tout de suite.'
                    : 'Déconnecté partout, il ne peut plus se connecter. Ses rooms à venir sont annulées.'
                }
                confirmLabel={u.suspension ? 'Lever la suspension' : 'Suspendre'}
                confirmKind={u.suspension ? 'venue' : 'room'}
                busy={mutation.isPending}
                error={mutation.error?.message}
                onCancel={() => setActing(false)}
                onConfirm={({ text, duration }) => {
                  const done = { onSuccess: () => setActing(false) }
                  if (u.suspension) unsuspend.mutate({ id, reason: text }, done)
                  else
                    suspend.mutate({ id, reason: text, days: suspensionDays(duration ?? '') }, done)
                }}
              />
            ) : u.suspension ? (
              <Button kind="ghost" label="Lever la suspension" onPress={() => setActing(true)} />
            ) : (
              <Button kind="room" label="Suspendre…" onPress={() => setActing(true)} />
            ),
        },
      ]}
    />
  )
}
