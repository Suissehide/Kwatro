import { Redirect, Stack } from 'expo-router'
import { useMeQuery } from '@/queries/useMe'

/** Back-office (KWT-20) : réservé au rôle ADMIN ; l'API refuse de toute façon (403) les autres comptes. */
export default function AdminLayout() {
  const me = useMeQuery({ required: true })
  if (!me) return null
  if (me.role !== 'ADMIN') return <Redirect href="/" />
  return <Stack screenOptions={{ headerShown: false }} />
}
