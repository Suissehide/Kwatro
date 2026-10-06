import { useLocalSearchParams } from 'expo-router'
import { AdminVenues } from '@/components/admin/AdminVenues'

/** Même vue que la liste, avec la fiche du lieu ouverte. */
export default function AdminVenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <AdminVenues key={id} initialId={id} />
}
