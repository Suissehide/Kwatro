import {
  Banner,
  Button,
  colors,
  EmptyState,
  ReviewCard,
  SkeletonCard,
  StatusPill,
  Tag,
} from '@lucko/design-system'
import { type AdminReport, REPORT_REASON_LABELS, type ReportResolution } from '@lucko/shared'
import { ShieldCheck } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { ActionDialog } from '@/components/admin/ActionDialog'
import { AdminScreen } from '@/components/admin/AdminScreen'
import { dateTime, openAdminUser } from '@/lib/admin'
import { useAdminModerationMutations, useAdminReportsQuery } from '@/queries/useAdminModeration'

const DIALOGS: Record<
  ReportResolution,
  { title: string; message: string; confirm: string; duration?: boolean; optional?: boolean }
> = {
  DISMISSED: {
    title: 'Classer le signalement ?',
    message: 'Aucune suite pour le joueur. Le motif est facultatif.',
    confirm: 'Classer',
    optional: true,
  },
  WARNED: {
    title: 'Avertir le joueur ?',
    message: 'Il reçoit ce message en notification, sur tous ses appareils.',
    confirm: 'Avertir',
  },
  SUSPENDED: {
    title: 'Suspendre le joueur ?',
    message:
      'Déconnecté partout, il ne peut plus se connecter. Ses rooms à venir sont annulées. Ses autres signalements ouverts sont clos.',
    confirm: 'Suspendre',
    duration: true,
  },
}

/** File des signalements (LKO-19, LKO-20) : mineurs en tête, puis du plus ancien. */
export default function AdminReportsScreen() {
  const reports = useAdminReportsQuery()
  const { resolveReport } = useAdminModerationMutations()
  const [open, setOpen] = useState<{ report: AdminReport; resolution: ReportResolution } | null>(
    null,
  )
  const dialog = open ? DIALOGS[open.resolution] : DIALOGS.DISMISSED

  return (
    <AdminScreen section="reports">
      {reports.isError ? (
        <Banner
          tone="err"
          message="Impossible de charger les signalements."
          action="Réessayer"
          onAction={() => void reports.refetch()}
        />
      ) : !reports.data ? (
        <SkeletonCard />
      ) : reports.data.length === 0 ? (
        <EmptyState
          dashed
          icon={<ShieldCheck size={28} color={colors.ink} strokeWidth={2.5} />}
          title="File vide"
          text="Aucun signalement en attente."
        />
      ) : (
        <View style={{ gap: 12 }}>
          {reports.data.map((report) => (
            <ReviewCard
              key={report.id}
              title={report.target.pseudo ?? 'Compte supprimé'}
              tags={
                <>
                  {report.target.minor ? <Tag label="-18" variant="tonight" /> : null}
                  {report.target.openReports > 1 ? (
                    <StatusPill tone="warn" label={`${report.target.openReports} signalements`} />
                  ) : null}
                </>
              }
              meta={`${REPORT_REASON_LABELS[report.reason]} · par ${report.reporter.pseudo ?? 'compte supprimé'} · ${dateTime(report.createdAt)}`}
              body={report.details || undefined}
              onPress={() => openAdminUser(report.target.id)}
              actions={
                <>
                  <Button
                    small
                    kind="ghost"
                    label="Classer"
                    onPress={() => setOpen({ report, resolution: 'DISMISSED' })}
                  />
                  <Button
                    small
                    kind="soft"
                    label="Avertir"
                    onPress={() => setOpen({ report, resolution: 'WARNED' })}
                  />
                  <Button
                    small
                    kind="room"
                    label="Suspendre"
                    onPress={() => setOpen({ report, resolution: 'SUSPENDED' })}
                  />
                </>
              }
            />
          ))}
        </View>
      )}
      <ActionDialog
        key={open ? `${open.report.id}-${open.resolution}` : 'closed'}
        visible={open !== null}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirm}
        optional={dialog.optional}
        duration={dialog.duration}
        destructive={open?.resolution !== 'DISMISSED'}
        onCancel={() => setOpen(null)}
        onConfirm={async ({ text, days }) => {
          if (!open) return
          const { report, resolution } = open
          await resolveReport.mutateAsync(
            resolution === 'SUSPENDED'
              ? { id: report.id, resolution, reason: text, days }
              : { id: report.id, resolution, reason: text },
          )
          setOpen(null)
        }}
      />
    </AdminScreen>
  )
}
