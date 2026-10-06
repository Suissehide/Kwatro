import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo'
import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black'
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { usePush } from '@/lib/push'
import { persistOptions, queryClient } from '@/lib/queryClient'
import { useMeQuery } from '@/queries/useMe'

function PushSetup() {
  usePush(useMeQuery()?.id)
  return null
}

export default function RootLayout() {
  // Noms identiques à ceux du design system (tokens `font()`)
  const [fontsLoaded] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    ArchivoBlack_400Regular,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  })
  if (!fontsLoaded) return null

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <PushSetup />
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </PersistQueryClientProvider>
  )
}
