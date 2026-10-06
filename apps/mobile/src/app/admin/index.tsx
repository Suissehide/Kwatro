import {
  Banner,
  colors,
  EmptyState,
  ListCard,
  ListRow,
  Section,
  SettingsGroup,
  SkeletonCard,
  StatCard,
} from '@lucko/design-system'
import { ADMIN_ACTION_LABELS } from '@lucko/shared'
import { History } from 'lucide-react-native'
import { useWindowDimensions, View } from 'react-native'
import { AdminScreen } from '@/components/admin/AdminScreen'
import { ADMIN_TITLES, adminSidebarItems, dateTime, openAdmin } from '@/lib/admin'
import { useAdminActionsQuery, useAdminDashboardQuery } from '@/queries/useAdminModeration'

const WIDE = 900

/** Tableau de bord du back-office (LKO-20) : ce qui attend l'équipe et les dernières actions. */
export default function AdminDashboardScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const dashboard = useAdminDashboardQuery()
  const actions = useAdminActionsQuery()
  const d = dashboard.data

  const stats = d
    ? [
        { value: d.openReports, label: 'Signalements ouverts', bg: colors.room, to: 'reports' },
        { value: d.minorReports, label: 'Dont sur un mineur', bg: colors.rating, to: 'reports' },
        { value: d.pendingAvatars, label: 'Photos à valider', bg: colors.event, to: 'avatars' },
        { value: d.pendingVenues, label: 'Lieux à valider', bg: colors.venue, to: 'venues' },
        { value: d.suspendedPlayers, label: 'Joueurs suspendus', bg: colors.white, to: 'users' },
      ]
    : []

  return (
    <AdminScreen section="dashboard">
      {dashboard.isError ? (
        <Banner
          tone="err"
          message="Impossible de charger le tableau de bord."
          action="Réessayer"
          onAction={() => void dashboard.refetch()}
        />
      ) : !d ? (
        <SkeletonCard />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {stats.map((s) => (
            <View key={s.label} style={{ flexGrow: 1, flexBasis: wide ? 160 : 140 }}>
              <StatCard
                value={String(s.value)}
                label={s.label}
                bg={s.bg}
                onPress={() => openAdmin(s.to)}
              />
            </View>
          ))}
        </View>
      )}

      {/* Desktop : la barre latérale mène aux files */}
      {wide ? null : (
        <SettingsGroup
          title="Files"
          rows={adminSidebarItems(d)
            .filter((item) => item.key !== 'dashboard')
            .map((item) => ({
              label: ADMIN_TITLES[item.key as keyof typeof ADMIN_TITLES],
              value: item.badge,
              onPress: () => openAdmin(item.key),
            }))}
        />
      )}

      <Section title="Dernières actions">
        {!actions.data ? (
          <SkeletonCard />
        ) : actions.data.length === 0 ? (
          <EmptyState
            dashed
            icon={<History size={28} color={colors.ink} strokeWidth={2.5} />}
            title="Aucune action pour l’instant"
            text="Chaque décision prise ici est tracée : qui, quoi, quand, sur qui et pourquoi."
          />
        ) : (
          <ListCard>
            {actions.data.map((a, i, all) => (
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
    </AdminScreen>
  )
}
