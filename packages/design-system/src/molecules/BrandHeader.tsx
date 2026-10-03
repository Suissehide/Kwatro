import type { ReactNode } from 'react'
import { View } from 'react-native'
import { space } from '../tokens'
import { Brand } from './Brand'

/** En-tête des écrans d'onglet sur téléphone : marque à gauche, `right` (ex. KwoteBadge) à droite. */
export function BrandHeader({ right }: { right?: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.screen,
        paddingTop: 6,
        paddingBottom: 12,
      }}
    >
      <Brand size={28} fontSize={20} />
      {right}
    </View>
  )
}
