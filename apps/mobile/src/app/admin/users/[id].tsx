import { useLocalSearchParams } from 'expo-router'
import { AdminUsers } from '@/components/admin/AdminUsers'

/** Même vue que la liste, avec la fiche du joueur ouverte. */
export default function AdminUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <AdminUsers key={id} initialId={id} />
}
