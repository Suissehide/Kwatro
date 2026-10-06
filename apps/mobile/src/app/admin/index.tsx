import {
  Banner,
  Button,
  Chip,
  type Column,
  colors,
  DataTable,
  EmptyState,
  PriorityBanner,
  QueueCard,
  Section,
  SkeletonCard,
  Swatch,
  TextLink,
  Typography,
} from '@lucko/design-system'
import { ADMIN_ACTION_LABELS, type AdminActionItem } from '@lucko/shared'
import { History } from 'lucide-react-native'
import { useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { AdminScreen } from '@/components/admin/AdminScreen'
import {
  ACTION_COLOR,
  inJournal,
  JOURNAL_FILTERS,
  type JournalFilter,
  logWhen,
  longToday,
  minorAlert,
  openAdmin,
  openTarget,
  queueCards,
} from '@/lib/admin'
import { useAdminActionsQuery, useAdminDashboardQuery } from '@/queries/useAdminModeration'
import { useMeQuery } from '@/queries/useMe'

const NARROW = 768
const PAGE = 15

const columns: Column<AdminActionItem>[] = [
  {
    key: 'when',
    label: 'Quand',
    width: 110,
    render: (a) => (
      <Typography variant="number" weight={400} style={{ color: colors.muted, fontSize: 12 }}>
        {logWhen(a.createdAt)}
      </Typography>
    ),
  },
  {
    key: 'action',
    label: 'Action',
    width: 220,
    render: (a) => <Swatch color={ACTION_COLOR[a.action]} label={ADMIN_ACTION_LABELS[a.action]} />,
  },
  {
    key: 'target',
    label: 'Cible',
    width: 150,
    render: (a) => {
      const { target } = a
      return target ? (
        <TextLink label={target.label} onPress={() => openTarget(target)} />
      ) : (
        <Typography variant="small">—</Typography>
      )
    },
  },
  {
    key: 'reason',
    label: 'Motif',
    render: (a) => (
      <Typography variant="small" numberOfLines={1} style={{ color: colors.ink }}>
        {a.reason || '—'}
      </Typography>
    ),
  },
  {
    key: 'by',
    label: 'Par',
    width: 80,
    render: (a) => (
      <Typography variant="small" numberOfLines={1} weight={700} style={{ color: colors.ink }}>
        {a.admin.pseudo ?? 'Admin'}
      </Typography>
    ),
  },
]

/** Tableau de bord du back-office (LKO-20) : alerte prioritaire, files à traiter, journal. */
export default function AdminDashboardScreen() {
  const narrow = useWindowDimensions().width < NARROW
  const me = useMeQuery()
  const dashboard = useAdminDashboardQuery()
  const actions = useAdminActionsQuery()
  const [filter, setFilter] = useState<JournalFilter>('all')
  const [shown, setShown] = useState(PAGE)
  const d = dashboard.data
  const journal = (actions.data ?? []).filter(inJournal(filter))

  return (
    <AdminScreen
      section="dashboard"
      kicker={longToday()}
      title={`Bonjour ${me?.pseudo ?? ''}`.trim()}
    >
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
        <>
          {d.minorReports > 0 ? (
            <PriorityBanner
              tag="Prioritaire"
              message={minorAlert(d.minorReports)}
              action="Traiter maintenant"
              onAction={() => openAdmin('reports')}
            />
          ) : null}
          <Section title="À traiter">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              {queueCards(d).map(({ key, ...card }) => (
                <QueueCard key={key} {...card} onPress={() => openAdmin(key)} />
              ))}
            </View>
          </Section>
        </>
      )}

      <Section
        title="Journal de modération"
        aside={
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {JOURNAL_FILTERS.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                active={filter === f.key}
                onPress={() => {
                  setFilter(f.key)
                  setShown(PAGE)
                }}
              />
            ))}
          </View>
        }
      >
        <DataTable
          dense
          columns={columns}
          rows={journal.slice(0, shown)}
          loading={!actions.data}
          mobileCards={narrow}
          primary="action"
          cardKeys={['when', 'target']}
          empty={
            <EmptyState
              dashed
              icon={<History size={28} color={colors.ink} strokeWidth={2.5} />}
              title="Aucune action"
              text="Chaque décision prise ici est tracée : qui, quoi, quand, sur qui et pourquoi."
            />
          }
        />
        {journal.length > shown ? (
          <View style={{ alignSelf: 'center' }}>
            <Button small kind="ghost" label="Voir plus" onPress={() => setShown(shown + PAGE)} />
          </View>
        ) : null}
      </Section>
    </AdminScreen>
  )
}
