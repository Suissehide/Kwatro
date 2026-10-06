import { Text, View } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { colors, font } from '../tokens'

/** Personne dans une ligne de tableau : avatar, nom, ligne secondaire ; `muted` si le nom manque. */
export function PersonCell({
  name,
  subtitle,
  uri,
  muted,
}: {
  name: string
  subtitle?: string
  uri?: string | null
  muted?: boolean
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <Avatar
        name={muted ? '?' : name}
        uri={uri}
        size={32}
        color={muted ? colors.inkMuted : undefined}
      />
      <View style={{ flexShrink: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            ...font('body', 800),
            fontSize: 14,
            color: muted ? colors.inkMuted : colors.ink,
          }}
        >
          {name}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{ ...font('body', 400), fontSize: 12, color: colors.muted }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  )
}
