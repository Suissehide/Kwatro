import { View } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { colors } from '../tokens'

const palette = [colors.event, colors.venue, colors.room, colors.kwote]

/** Avatars superposés (joueurs d'une room), couleurs en rotation. */
export function AvatarStack({ names, size = 28 }: { names: string[]; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', paddingRight: 6 }}>
      {names.map((name, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: des initiales peuvent se répéter
        <View key={i} style={{ marginRight: -6 }}>
          <Avatar name={name} color={palette[i % palette.length]} size={size} />
        </View>
      ))}
    </View>
  )
}
