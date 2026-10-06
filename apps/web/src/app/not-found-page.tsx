'use client'
import { CONTACT_EMAIL, NotFound, TopNav } from '@lucko/design-system'
import { usePathname, useRouter } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { View } from 'react-native'
import { Footer } from './site-footer'

const WIDE = '(min-width: 900px)'

function subscribe(onChange: () => void) {
  const query = matchMedia(WIDE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function NotFoundPage() {
  const router = useRouter()
  const path = usePathname()
  const wide = useSyncExternalStore(
    subscribe,
    () => matchMedia(WIDE).matches,
    () => false,
  )

  return (
    <View style={{ minHeight: '100vh' as unknown as number }}>
      <TopNav onHome={() => router.push('/')} />
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          width: '100%',
          maxWidth: 1200,
          alignSelf: 'center',
          paddingHorizontal: wide ? 32 : 24,
          paddingTop: wide ? 96 : 48,
          paddingBottom: wide ? 112 : 48,
        }}
      >
        <NotFound
          wide={wide}
          onHome={() => router.push('/')}
          secondary={{ label: 'Rejoindre la liste', onPress: () => router.push('/#liste') }}
          report={{
            prompt: 'Un lien cassé sur le site ?',
            onPress: () => {
              location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Lien cassé : ${path}`)}`
            },
          }}
        />
      </View>
      <Footer />
    </View>
  )
}
