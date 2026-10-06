import {
  colors,
  MobileScreen,
  PageTitle,
  ScreenHeader,
  Sidebar,
  TextLink,
  WebSidebarLayout,
} from '@kwatro/design-system'
import type { ReactNode } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ADMIN_TITLES, type AdminSection, adminSidebarItems, openAdmin } from '@/lib/admin'
import { goBack, openHome } from '@/lib/navigation'
import { useAdminDashboardQuery } from '@/queries/useAdminModeration'

const WIDE = 900

/**
 * Écran du back-office : barre latérale des files sur desktop ; sur téléphone, en-tête avec retour
 * (vers le tableau de bord, ou l'app depuis le tableau de bord).
 */
export function AdminScreen({
  section,
  title = ADMIN_TITLES[section],
  back,
  children,
}: {
  section: AdminSection
  /** Titre d'une fiche (joueur, lieu) ; par défaut celui de la section. */
  title?: string
  /** Fiche ouverte depuis une liste : retour à l'écran précédent. */
  back?: boolean
  children: ReactNode
}) {
  const wide = useWindowDimensions().width >= WIDE
  const insets = useSafeAreaInsets()
  const dashboard = useAdminDashboardQuery().data

  if (!wide) {
    const onBack = back ? goBack : section === 'dashboard' ? openHome : () => openAdmin('dashboard')
    return (
      <MobileScreen
        insets={insets}
        siteFooter={false}
        header={<ScreenHeader title={title} onBack={onBack} />}
      >
        {children}
      </MobileScreen>
    )
  }

  return (
    <WebSidebarLayout
      sidebar={
        <Sidebar
          title="Back-office"
          items={adminSidebarItems(dashboard)}
          active={section}
          onSelect={openAdmin}
          color={colors.ink}
          footer={<TextLink label="← Retour à l’app" onPress={openHome} />}
        />
      }
    >
      <View style={{ width: '100%', maxWidth: 960, gap: 20 }}>
        {back ? (
          <View style={{ alignSelf: 'flex-start' }}>
            <TextLink label="← Retour" onPress={goBack} />
          </View>
        ) : null}
        <PageTitle title={title} />
        {children}
      </View>
    </WebSidebarLayout>
  )
}
