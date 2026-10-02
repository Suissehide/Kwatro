import { type DimensionValue, View } from 'react-native'
import { colors } from '../tokens'

export function Skeleton({
  width = '100%',
  height = 14,
  r = 6,
}: {
  width?: DimensionValue
  height?: number
  r?: number
}) {
  return <View style={{ width, height, borderRadius: r, backgroundColor: colors.skeleton }} />
}
