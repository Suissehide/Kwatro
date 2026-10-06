import { StatusPill } from '@lucko/design-system'
import type { AdminUser } from '@lucko/shared'
import { View } from 'react-native'
import { suspensionLabel } from '@/lib/admin'

/** Pastilles d'état d'un compte : actif ou suspendu, et mineur. */
export function UserStatus({ user }: { user: Pick<AdminUser, 'suspension' | 'minor'> }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {user.suspension ? (
        <StatusPill tone="err" label={suspensionLabel(user.suspension)} />
      ) : (
        <StatusPill tone="ok" label="Actif" />
      )}
      {user.minor ? <StatusPill tone="warn" label="Mineur" /> : null}
    </View>
  )
}
