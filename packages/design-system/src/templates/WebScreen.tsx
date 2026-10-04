import type { ReactNode } from 'react'
import { ScrollView, type StyleProp, View, type ViewStyle } from 'react-native'
import { colors } from '../tokens'

export function WebScreen({
  nav,
  children,
  footer,
  contentStyle,
}: {
  nav: ReactNode
  children: ReactNode
  /** Pied de page du site (SiteFooter), pleine largeur après le contenu. */
  footer?: ReactNode
  contentStyle?: StyleProp<ViewStyle>
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {nav}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={[
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
        </View>
        {footer}
      </ScrollView>
    </View>
  )
}
