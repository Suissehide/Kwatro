import { MobileScreen, type PlayerTab, PlayerTabBar, WebScreen } from '@lucko/design-system'
import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { openCreateRoom, openTab } from '@/lib/navigation'
import { useTabBadges } from '@/queries/useChat'
import { PlayerNav } from './PlayerNav'

/** Écran d'un onglet joueur : barre du site sur desktop, barre d'onglets sur téléphone. */
export function PlayerScreen({
  tab,
  wide,
  header,
  pushed,
  footer,
  children,
}: {
  tab: PlayerTab
  wide: boolean
  /** Téléphone : en-tête fixe au-dessus du contenu. */
  header?: ReactNode
  /** Écran poussé (édition) : pas de barre d'onglets sur téléphone. */
  pushed?: boolean
  /** Actions : pied fixe sur téléphone, à la suite du contenu sur desktop. */
  footer?: ReactNode
  children: ReactNode
}) {
  const insets = useSafeAreaInsets()
  const badges = useTabBadges()
  if (!wide) {
    return (
      <MobileScreen
        insets={insets}
        header={header}
        footer={footer}
        tabBar={
          pushed ? undefined : (
            <PlayerTabBar
              active={tab}
              badges={badges}
              onSelect={openTab}
              onCreate={() => openCreateRoom()}
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
      {footer}
    </WebScreen>
  )
}
