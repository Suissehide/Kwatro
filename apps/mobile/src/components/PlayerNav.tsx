import { Button, playerNavItems, TopNav } from '@kwatro/design-system'
import { openCreateRoom, openHome, openSettings, openSite, openTab } from '@/lib/navigation'
import { visibleAvatar } from '@/lib/profile'
import { useTabBadges } from '@/queries/useChat'
import { signOut, useMeQuery } from '@/queries/useMe'

/** Barre du site des écrans joueur (desktop) : onglets, création de room et menu du compte. */
export function PlayerNav({ active, create = true }: { active: string; create?: boolean }) {
  const me = useMeQuery()
  const badges = useTabBadges()
  return (
    <TopNav
      items={playerNavItems.map((item) => ({ ...item, badge: badges[item.key as 'messages'] }))}
      active={active}
      onSelect={openTab}
      onHome={openHome}
      right={
        create ? (
          <Button small kind="kwote" label="+ Créer une room" onPress={() => openCreateRoom()} />
        ) : null
      }
      account={
        me
          ? {
              pseudo: me.pseudo ?? '',
              email: me.email,
              avatarUri: visibleAvatar(me),
              items: [
                { label: 'Mon profil', onPress: () => openTab('profil') },
                { label: 'Réglages du compte', onPress: openSettings },
                { label: 'Aide', onPress: () => openSite('/aide') },
              ],
              onSignOut: () => void signOut(),
            }
          : undefined
      }
    />
  )
}
