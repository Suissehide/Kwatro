import { View } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { colors } from '../tokens'

const palette = [colors.event, colors.venue, colors.room, colors.kwote]

export function AvatarStack({ names, size = 28 }: { names: string[]; size?: number }) {
  // Des initiales peuvent se répéter : la clé compte les occurrences (M, M2…)
  const seen = new Map<string, number>()
  const avatars = names.map((name) => {
    const n = (seen.get(name) ?? 0) + 1
    seen.set(name, n)
    return { name, key: n > 1 ? `${name}${n}` : name }
  })
  return (
    <View style={{ flexDirection: 'row', paddingRight: 6 }}>
      {avatars.map(({ name, key }, i) => (
        <View key={key} style={{ marginRight: -6 }}>
          <Avatar name={name} color={palette[i % palette.length]} size={size} />
        </View>
      ))}
    </View>
  )
}
