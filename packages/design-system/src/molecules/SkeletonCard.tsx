import { View } from 'react-native'
import { Skeleton } from '../atoms/Skeleton'
import { border, colors, radius } from '../tokens'

export function SkeletonCard() {
  return (
    <View
      aria-busy
      aria-label="Chargement"
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: 8,
          backgroundColor: colors.skeleton,
          borderBottomWidth: border.base,
          borderColor: colors.ink,
        }}
      />
      <View style={{ padding: 14, gap: 8 }}>
        <Skeleton width={130} height={18} r={4} />
        <Skeleton width="85%" height={16} />
        <Skeleton width="60%" height={12} />
      </View>
    </View>
  )
}
