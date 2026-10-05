import {
  BrandHeader,
  CONTACT_EMAIL,
  MobileScreen,
  NotFound,
  PlayerTabBar,
  WebScreen,
} from '@kwatro/design-system'
import { usePathname } from 'expo-router'
import { Linking, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PlayerNav } from '@/components/PlayerNav'
import { openCreateRoom, openHome, openTab } from '@/lib/navigation'

const WIDE = 900

export default function NotFoundScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const insets = useSafeAreaInsets()
  const path = usePathname()

  const content = (
    <NotFound
      wide={wide}
      onHome={openHome}
      // L'accueil Explorer liste les lieux ouverts autour de toi
      secondary={{ label: 'Lieux près de toi', onPress: openHome }}
      report={{
        prompt: "Un lien cassé dans l'app ?",
        onPress: () =>
          Linking.openURL(
            `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Lien cassé : ${path}`)}`,
          ),
      }}
    />
  )

  if (!wide) {
    return (
      <MobileScreen
        insets={insets}
        siteFooter={false}
        header={<BrandHeader onHome={openHome} />}
        tabBar={
          <PlayerTabBar
            onSelect={openTab}
            onCreate={() => openCreateRoom()}
            bottomInset={Math.max(22, insets.bottom)}
          />
        }
      >
        {content}
      </MobileScreen>
    )
  }

  return (
    <WebScreen
      nav={<PlayerNav active="" />}
      contentStyle={{ paddingTop: 96, paddingBottom: 112, justifyContent: 'center' }}
    >
      {content}
    </WebScreen>
  )
}
