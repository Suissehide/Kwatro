import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { colors, grid, space } from '../tokens'

/** Squelette web à barre latérale (espace lieu W2, admin W3) : sidebar fixe + contenu défilant. */
export function WebSidebarLayout({
  sidebar,
  children,
}: {
  sidebar: ReactNode
  children: ReactNode
}) {
  return (
    <View
      style={{ flex: 1, minHeight: '100%', flexDirection: 'row', backgroundColor: colors.cream }}
    >
      {sidebar}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: grid.desktop.margin,
          paddingHorizontal: space.page,
          gap: grid.desktop.gutter,
        }}
      >
        {children}
      </ScrollView>
    </View>
  )
}
