import {
  MobileScreen,
  playerItems,
  ScreenHeader,
  TextLink,
  TopNav,
  WebScreen,
} from '@kwatro/design-system'
import type { ReactNode } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { goBack, openHome, openTab } from '@/lib/navigation'
import { useMe } from '@/lib/useMe'

const WIDE = 900

/**
 * Fiche (lieu, événement) : en-tête avec retour et actions en pied fixe sur téléphone ;
 * sur desktop, barre de navigation, colonne centrée et actions sous le contenu.
 */
export function DetailScreen({
  title,
  footer,
  children,
}: {
  title: string
  footer?: ReactNode
  children: ReactNode
}) {
  const wide = useWindowDimensions().width >= WIDE
  const insets = useSafeAreaInsets()
  const me = useMe()

  if (!wide) {
    return (
      <MobileScreen
        insets={insets}
        header={<ScreenHeader title={title} onBack={goBack} />}
        footer={footer}
      >
        {children}
      </MobileScreen>
    )
  }

  return (
    <WebScreen
      nav={
        <TopNav
          items={playerItems}
          active="explorer"
          onSelect={openTab}
          onHome={openHome}
          avatar={me?.pseudo ?? ''}
          onAvatar={() => openTab('profil')}
        />
      }
    >
      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center', gap: 28 }}>
        <View style={{ alignSelf: 'flex-start' }}>
          <TextLink label="← Retour" onPress={goBack} />
        </View>
        {children}
        {footer ? <View style={{ alignSelf: 'flex-start', gap: 12 }}>{footer}</View> : null}
      </View>
    </WebScreen>
  )
}
