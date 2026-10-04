import { MobileScreen, type PlayerTab, PlayerTabBar, WebScreen } from '@kwatro/design-system'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { notYet, openTab } from '@/lib/navigation'
import { PlayerNav } from './PlayerNav'

/** Écran d'un onglet joueur : barre du site sur desktop, barre d'onglets sur téléphone. */
export function PlayerScreen({
  tab,
  wide,
  header,
  pushed,
  children,
}: {
  tab: PlayerTab
  wide: boolean
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
    <WebScreen nav={<PlayerNav active={tab} />} contentStyle={{ gap: 40 }}>
      {children}
    </WebScreen>
  )
}
