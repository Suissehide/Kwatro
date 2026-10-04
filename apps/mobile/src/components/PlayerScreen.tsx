import {
  Button,
  MobileScreen,
  type PlayerTab,
  PlayerTabBar,
  playerItems,
  TopNav,
  WebScreen,
} from '@kwatro/design-system'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { notYet, openHome, openTab } from '@/lib/navigation'

/** Écran d'un onglet joueur : barre du site sur desktop, barre d'onglets sur téléphone. */
export function PlayerScreen({
  tab,
  wide,
  pseudo,
  header,
  pushed,
  children,
}: {
  tab: PlayerTab
  wide: boolean
  pseudo?: string | null
  /** Téléphone : en-tête fixe au-dessus du contenu. */
  header?: ReactNode
  /** Écran poussé (édition) : pas de barre d'onglets sur téléphone. */
  pushed?: boolean
  children: ReactNode
}) {
  const insets = useSafeAreaInsets()
  if (!wide) {
    return (
      <MobileScreen
        insets={insets}
        header={header}
        tabBar={
          pushed ? undefined : (
            <PlayerTabBar
              active={tab}
              onSelect={openTab}
              onCreate={notYet}
              bottomInset={Math.max(22, insets.bottom)}
            />
          )
        }
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
          active={tab}
          onSelect={openTab}
          onHome={openHome}
          right={<Button small kind="kwote" label="+ Créer une room" onPress={notYet} />}
          avatar={pseudo ?? ''}
          onAvatar={() => openTab('profil')}
        />
      }
      contentStyle={{ gap: 40 }}
    >
      {children}
    </WebScreen>
  )
}
