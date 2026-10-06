import {
  type Column,
  DataTable,
  EmptyState,
  StatusPill,
  TextField,
  Typography,
} from '@kwatro/design-system'
import type { AdminUser } from '@kwatro/shared'
import { useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { AdminScreen } from '@/components/admin/AdminScreen'
import { openAdminUser, suspensionLabel } from '@/lib/admin'
import { useAdminUsersQuery } from '@/queries/useAdminModeration'

const NARROW = 768

const ROLE_LABELS: Record<AdminUser['role'], string> = {
  PLAYER: 'Joueur',
  VENUE_STAFF: 'Staff lieu',
  ADMIN: 'Admin',
}

const columns: Column<AdminUser>[] = [
  {
    key: 'pseudo',
    label: 'Pseudo',
    flex: 1.2,
    render: (u) => <Typography variant="label">{u.pseudo ?? '—'}</Typography>,
  },
  { key: 'email', label: 'E-mail', flex: 1.6 },
  {
    key: 'role',
    label: 'Rôle',
    width: 100,
    render: (u) => <Typography>{ROLE_LABELS[u.role]}</Typography>,
  },
  { key: 'openReports', label: 'Signal.', width: 70, align: 'right', mono: true },
  {
    key: 'status',
    label: 'Statut',
    width: 230,
    render: (u) =>
      u.suspension ? (
        <StatusPill tone="err" label={suspensionLabel(u.suspension)} />
      ) : u.minor ? (
        <StatusPill tone="warn" label="Mineur" />
      ) : (
        <StatusPill tone="ok" label="Actif" />
      ),
  },
]

/** Recherche de joueurs par pseudo, e-mail ou id ; sans recherche, les derniers inscrits. */
export default function AdminUsersScreen() {
  const narrow = useWindowDimensions().width < NARROW
  const [q, setQ] = useState('')
  const users = useAdminUsersQuery(q.trim())

  return (
    <AdminScreen section="users">
      <TextField
        label="Rechercher"
        placeholder="Pseudo, e-mail ou id"
        value={q}
        onChangeText={setQ}
        autoCapitalize="none"
      />
      <DataTable
        columns={columns}
        rows={users.data ?? []}
        loading={!users.data}
        onRowPress={(u) => openAdminUser(u.id)}
        mobileCards={narrow}
        primary="pseudo"
        cardKeys={['email']}
        statusKey="status"
        empty={
          <EmptyState
            dashed
            icon={<Typography variant="h2">?</Typography>}
            title="Aucun joueur"
            text="Personne ne correspond à cette recherche."
          />
        }
      />
    </AdminScreen>
  )
}
