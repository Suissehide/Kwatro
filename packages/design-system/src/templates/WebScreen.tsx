import type { ReactNode } from 'react'
import { ScrollView, type StyleProp, View, type ViewStyle } from 'react-native'
import { colors } from '../tokens'

/**
 * Squelette web à barre du haut (accueil joueur, connexion) : `nav` fixe (TopNav), contenu défilant
 * centré sur 1200 px. `contentStyle` remplace la mise en page du contenu.
 */
export function WebScreen({
  nav,
  children,
  contentStyle,
}: {
  nav: ReactNode
  children: ReactNode
  contentStyle?: StyleProp<ViewStyle>
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {nav}
      <ScrollView
        contentContainerStyle={[
          {
            flexGrow: 1,
            width: '100%',
            maxWidth: 1200,
            alignSelf: 'center',
            paddingHorizontal: 32,
            paddingTop: 48,
            paddingBottom: 72,
            gap: 32,
          },
          contentStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  )
}
